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
    // SUPERADMIN: CLÍNICAS
    // ==========================

    public function index()
    {
        return response()->json(Clinic::orderBy('id', 'desc')->get());
    }

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
        ]);

        return response()->json([
            'message' => 'Clínica creada',
            'clinic'  => $clinic,
        ], 201);
    }

    public function update(Request $request, Clinic $clinic)
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
        ]);

        $clinic->update([
            'name'        => $data['name'],
            'province'    => $data['province'] ?? $clinic->province ?? null,
            'canton'      => $data['canton'] ?? $clinic->canton ?? null,
            'address'     => $data['address'] ?? $clinic->address ?? null,
            'phone'       => $data['phone'] ?? $clinic->phone ?? null,
            'hours'       => $data['hours'] ?? $clinic->hours ?? null,
            'admin_email' => $data['admin_email'] ?? $clinic->admin_email ?? null,
            'ruc'         => $data['ruc'] ?? $clinic->ruc ?? null,
        ]);

        return response()->json([
            'message' => 'Clínica actualizada',
            'clinic'  => $clinic->fresh(),
        ]);
    }

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
    // CLINIC_ADMIN: CLIENTES / VETERINARIOS
    // (tu código existente se mantiene igual desde aquí)
    // ==========================

    public function getClients(Request $request)
    {
        if (!$request->user()->hasRole('clinic_admin')) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $clinicId = $request->user()->clinic_id;

        $clients = User::role('client')
            ->where('clinic_id', $clinicId)
            ->withTrashed()
            ->withCount('pets')
            ->with(['appointments' => function ($query) {
                $query->orderBy('created_at', 'desc');
            }, 'pets'])
            ->get()
            ->map(function ($client) {
                $appointmentsCount = $client->appointments->count();
                $lastAppointment = $client->appointments->first()?->created_at;
                $mostUsedService = $client->appointments->groupBy('service')->keys()->first();
                $lastVeterinarian = $client->appointments->first()?->veterinarian?->name;

                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'phone' => $client->phone,
                    'email' => $client->email,
                    'pets_count' => $client->pets_count,
                    'appointments_count' => $appointmentsCount,
                    'last_appointment' => $lastAppointment,
                    'most_used_service' => $mostUsedService,
                    'last_veterinarian' => $lastVeterinarian,
                    'is_restricted' => $client->trashed(),
                    'pets' => $client->pets->map(function ($pet) {
                        return [
                            'id' => $pet->id,
                            'name' => $pet->name,
                            'species' => $pet->species,
                            'breed' => $pet->breed,
                            'birth_date' => $pet->birth_date,
                        ];
                    }),
                ];
            });

        return response()->json($clients);
    }

    public function createClient(Request $request)
    {
        if (!$request->user()->hasRole('clinic_admin')) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

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

        return response()->json([
            'message' => 'Cliente creado',
            'user' => $user,
        ], 201);
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
        if (!$request->user()->hasRole('clinic_admin') || $request->user()->clinic_id !== $user->clinic_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($user->trashed()) {
            $user->restore();
            $message = 'Cliente activado';
        } else {
            $user->delete();
            $message = 'Cliente restringido';
        }

        return response()->json(['message' => $message]);
    }

    public function getVeterinarians(Request $request)
    {
        if (!$request->user()->hasRole('clinic_admin')) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $clinicId = $request->user()->clinic_id;

        $veterinarians = User::role('veterinarian')
            ->where('clinic_id', $clinicId)
            ->get(['id', 'name', 'email', 'phone']);

        return response()->json($veterinarians);
    }

    public function updateVeterinarian(Request $request, User $user)
    {
        if (
            !$request->user()->hasRole('clinic_admin') ||
            $request->user()->clinic_id !== $user->clinic_id ||
            !$user->hasRole('veterinarian')
        ) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:50',
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Veterinario actualizado',
            'user' => $user,
        ]);
    }

    public function deleteVeterinarian(Request $request, User $user)
    {
        if (
            !$request->user()->hasRole('clinic_admin') ||
            $request->user()->clinic_id !== $user->clinic_id ||
            !$user->hasRole('veterinarian')
        ) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Veterinario eliminado']);
    }
}
