<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // REGISTER (Mantenemos tu lógica original)
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'clinic_id' => 'required|exists:clinics,id',
            'role' => 'required|in:client,veterinarian,clinic_admin',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'clinic_id' => $request->clinic_id,
        ]);

        $user->assignRole($request->role);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => $user->load('roles'),
            'token' => $token,
            'token_type' => 'Bearer'
        ], 201);
    }

    // LOGIN (Mantenemos tu estructura de respuesta con 'token' y 'clinic_id')
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $email = strtolower($request->email); 

        // Buscamos usuario ignorando mayúsculas/minúsculas
        $user = User::whereRaw('lower(email) = ?', [$email])->first();

        // Verificamos contraseña
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }

        // Eliminamos tokens viejos para mantener limpieza (opcional, pero recomendado)
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        // ✅ RESPUESTA EXACTA QUE TU APP ESPERA
        return response()->json([
            'message' => 'Login exitoso',
            'user' => $user->load('roles'),
            'clinic_id' => $user->clinic_id, // Vital para tu frontend
            'token' => $token,               // Vital para tu frontend
            'token_type' => 'Bearer'
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    // ME
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('roles'),
            'clinic_id' => $request->user()->clinic_id,
        ]);
    }

    // ACTUALIZAR PERFIL (✅ ÚNICO CAMBIO: Agregamos 'phone')
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20', // Agregado para que puedas editar teléfono
        ]);

        // Actualizamos nombre, email y teléfono
        $user->update($request->only('name', 'email', 'phone'));

        return response()->json([
            'message' => 'Perfil actualizado',
            'user' => $user->load('roles')
        ]);
    }

    // CAMBIAR CONTRASEÑA
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'La contraseña actual es incorrecta'], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Contraseña actualizada con éxito']);
    }
}