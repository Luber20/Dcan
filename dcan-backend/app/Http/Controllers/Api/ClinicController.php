<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ClinicController extends Controller
{
    // ==========================
    // 1. GESTIÓN DE CLÍNICAS (Público y SuperAdmin)
    // ==========================

    // Listar solo activas (Para App Clientes)
    public function index()
    {
        return response()->json(Clinic::where('is_active', true)->orderBy('name', 'asc')->get());
    }

    // Listar TODAS (Para SuperAdmin)
    public function indexAdmin()
    {
        return response()->json(Clinic::orderBy('id', 'desc')->get());
    }

    // Ver detalles (Público)
    public function show($id)
    {
        $clinic = Clinic::findOrFail($id);
        return response()->json($clinic);
    }

    // Crear (SuperAdmin)
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'province'    => 'nullable|string|max:255',
            'canton'      => 'nullable|string|max:255',
            'address'     => 'nullable|string|max:255',
            'phone'       => 'nullable|string|max:50',
            'hours'       => 'nullable|string|max:255',
            'admin_email' => 'nullable|email|max:255',
            'ruc'         => 'nullable|string|max:50',
            // ✅ CORRECCIÓN: Validamos coordenadas
            'latitude'    => 'nullable|numeric',  
            'longitude'   => 'nullable|numeric',
        ]);

        $clinic = Clinic::create([
            'name'        => $data['name'],
            'province'    => $data['province'] ?? null,
            'canton'      => $data['canton'] ?? null,
            'address'     => $data['address'] ?? null,
            'phone'       => $data['phone'] ?? null,
            'hours'       => $data['hours'] ?? null,
            'admin_email' => $data['admin_email'] ?? null,
            'ruc'         => $data['ruc'] ?? null,
            'is_active'   => true,
            // ✅ CORRECCIÓN: AHORA SÍ SE GUARDAN EN LA BD
            'latitude'    => $data['latitude'] ?? null,
            'longitude'   => $data['longitude'] ?? null,
        ]);

        return response()->json(['message' => 'Clínica creada', 'clinic' => $clinic], 201);
    }

    // Actualizar (Dueño o SuperAdmin)
    public function update(Request $request, Clinic $clinic)
    {
        $user = $request->user();

        // Seguridad
        if (!$user->hasRole('superadmin') && !$user->hasRole('super_admin')) {
            if ($user->clinic_id !== $clinic->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
        }

        // Validación flexible (sometimes)
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'province'    => 'sometimes|nullable|string|max:255',
            'canton'      => 'sometimes|nullable|string|max:255',
            'address'     => 'sometimes|nullable|string|max:255',
            'phone'       => 'sometimes|nullable|string|max:50',
            'hours'       => 'sometimes|nullable|string|max:255',
            'admin_email' => 'sometimes|nullable|email|max:255',
            'ruc'         => 'sometimes|nullable|string|max:50',
            'photo_url'   => 'sometimes|nullable|string',
            'description' => 'sometimes|nullable|string',
            // ✅ CORRECCIÓN CRÍTICA: Agregamos validación para que update() las acepte
            'latitude'    => 'sometimes|nullable|numeric',
            'longitude'   => 'sometimes|nullable|numeric',
        ]);

        $clinic->update($data);

        return response()->json([
            'message' => 'Información actualizada correctamente',
            'clinic'  => $clinic->fresh(),
        ]);
    }

    // Activar/Desactivar Clínica
    public function toggle(Clinic $clinic)
    {
        $clinic->is_active = !$clinic->is_active;
        $clinic->save();

        return response()->json([
            'message' => $clinic->is_active ? 'Clínica activada' : 'Clínica inactivada',
            'clinic'  => $clinic,
        ]);
    }

    // ==========================
    // 2. GESTIÓN INTERNA (Admin Clínica)
    // ==========================

    public function getClients(Request $request)
    {
        if (!$request->user()->hasRole('clinic_admin')) return response()->json(['message' => 'No autorizado'], 403);
        $clinicId = $request->user()->clinic_id;
        $clients = User::role('client')->where('clinic_id', $clinicId)->withTrashed()->with(['appointments', 'pets'])->get();
        return response()->json($clients);
    }

    public function createClient(Request $request)
    {
        if (!$request->user()->hasRole('clinic_admin')) return response()->json(['message' => 'No autorizado'], 403);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:50',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'],
            'clinic_id' => $request->user()->clinic_id,
        ]);
        $user->assignRole('client');

        return response()->json(['message' => 'Cliente creado', 'user' => $user], 201);
    }

    public function deleteClient(Request $request, User $user)
    {
        if (!$request->user()->hasRole('clinic_admin') || $request->user()->clinic_id !== $user->clinic_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'Cliente eliminado']);
    }

    public function toggleClient(Request $request, User $user)
    {
        if ($request->user()->hasRole('clinic_admin')) {
             if($request->user()->clinic_id !== $user->clinic_id) return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($user->trashed()) {
            $user->restore();
            $message = 'Usuario activado';
        } else {
            $user->delete();
            $message = 'Usuario bloqueado';
        }
        return response()->json(['message' => $message]);
    }

    public function getVeterinarians(Request $request)
    {
        if (!$request->user()->hasRole('clinic_admin')) return response()->json(['message' => 'No autorizado'], 403);
        $clinicId = $request->user()->clinic_id;
        return response()->json(User::role('veterinarian')->where('clinic_id', $clinicId)->get());
    }

    public function updateVeterinarian(Request $request, User $user)
    {
        if (!$request->user()->hasRole('clinic_admin') || $request->user()->clinic_id !== $user->clinic_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $data = $request->validate(['name' => 'required', 'email' => 'required|email', 'phone' => 'nullable']);
        $user->update($data);
        return response()->json(['message' => 'Veterinario actualizado', 'user' => $user]);
    }

    public function deleteVeterinarian(Request $request, User $user)
    {
        if (!$request->user()->hasRole('clinic_admin') || $request->user()->clinic_id !== $user->clinic_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'Veterinario eliminado']);
    }

    // ==========================
    // 3. 👑 SUPER ADMIN: GESTIÓN TOTAL USUARIOS
    // ==========================

    public function updateGlobalUser(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'phone' => 'nullable|string',
            'password' => 'nullable|string|min:6',
            'role' => 'required|string',
            'clinic_id' => 'nullable',
        ]);

        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'clinic_id' => $data['clinic_id']
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);
        $user->syncRoles([$data['role']]);

        return response()->json(['message' => 'Usuario actualizado correctamente', 'user' => $user]);
    }

    public function deleteGlobalUser(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'No puedes eliminarte a ti mismo.'], 400);
        }

        $user->forceDelete();
        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }
}