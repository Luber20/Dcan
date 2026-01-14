<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Clinic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // REGISTER (para clientes o admins de clínica)
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'clinic_id' => 'required|exists:clinics,id',  // La clínica debe existir
            'role' => 'required|in:client,veterinarian,clinic_admin',  // Solo estos roles por registro
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'clinic_id' => $request->clinic_id,
        ]);

        // Asignar rol
        $user->assignRole($request->role);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => $user->load('roles'),
            'token' => $token,
            'token_type' => 'Bearer'
        ], 201);
    }

    // LOGIN
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $email = strtolower($request->email); // ← Forzamos minúsculas

        $user = User::whereRaw('lower(email) = ?', [$email])->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'user' => $user->load('roles'),
            'clinic_id' => $user->clinic_id,
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    // LOGOUT (revoca el token actual)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    // ME (obtener datos del usuario autenticado)
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('roles'),
            'clinic_id' => $request->user()->clinic_id,
        ]);
    }

   
    // ACTUALIZAR PERFIL (Nombre/Email)
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($request->only('name', 'email'));

        return response()->json([
            'message' => 'Perfil actualizado',
            'user' => $user->load('roles')
        ]);
    }

    // CAMBIAR CONTRASEÑA CON VALIDACIÓN
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        // Verificar que la contraseña actual sea correcta
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'La contraseña actual es incorrecta'], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Contraseña actualizada con éxito']);
    }

}