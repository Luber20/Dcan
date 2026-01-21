<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    // Registro público de clientes (desde la App al registrarse solo)
    public function registerClient(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'clinic_id' => 'required|exists:clinics,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Errores de validación', 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'clinic_id' => $request->clinic_id,
        ]);

        $user->assignRole('client');
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registro exitoso',
            'user' => $user->load('roles'),
            'token' => $token,
        ], 201);
    }

    // Registro de Veterinarios por parte del Dueño de Clínica
    public function registerVeterinarian(Request $request)
    {
        if (!$request->user()->hasRole('clinic_admin')) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Errores de validación', 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'clinic_id' => $request->user()->clinic_id, // Asigna autom. la clínica del dueño
        ]);

        // Asignamos rol en inglés y español por seguridad
        $user->assignRole('veterinarian');

        return response()->json(['message' => 'Veterinario registrado', 'user' => $user], 201);
    }

    /**
     * ✅ NUEVA FUNCIÓN: CREACIÓN DE USUARIOS POR SUPER ADMIN
     * Permite crear Dueños, Veterinarios o Clientes y asignar clínica manualmente.
     */
    public function registerAdminUser(Request $request)
    {
        // 1. Validaciones
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string', // superadmin, clinic_admin, veterinarian, client
            // clinic_id es opcional para superadmin, pero obligatorio para los demás
            'clinic_id' => 'nullable|exists:clinics,id', 
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
        }

        // 2. Crear el usuario
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'clinic_id' => $request->clinic_id, // Puede ser null si es SuperAdmin
        ]);

        // 3. Asignar el Rol
        // Mapeamos lo que envía el frontend a los roles de Spatie
        $roleMap = [
            'superadmin' => 'superadmin',
            'admin' => 'clinic_admin',       // Frontend envía 'admin' o 'clinic_admin'
            'clinic_admin' => 'clinic_admin',
            'veterinario' => 'veterinario',  // Frontend envía 'veterinario' o 'veterinarian'
            'veterinarian' => 'veterinarian',
            'client' => 'client',
            'cliente' => 'client'
        ];

        $roleName = $roleMap[$request->role] ?? 'client';
        
        // Asignamos el rol (si es veterinario, intentamos asignar ambos por compatibilidad)
        if ($roleName == 'veterinarian' || $roleName == 'veterinario') {
             // Intenta asignar el que exista en tu BD
             try { $user->assignRole('veterinarian'); } catch (\Exception $e) {}
             try { $user->assignRole('veterinario'); } catch (\Exception $e) {}
        } else {
             $user->assignRole($roleName);
        }

        return response()->json([
            'message' => 'Usuario creado exitosamente por Admin',
            'user' => $user->load('roles')
        ], 201);
    }
}