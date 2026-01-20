<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller {
    
    // ==========================================
    // 📋 MÉTODOS PARA CLIENTES
    // ==========================================
    
    public function index() {
        try {
            $appointments = Appointment::where('user_id', Auth::id())
                ->with(['pet', 'veterinarian'])
                ->orderBy('date', 'desc')
                ->get();
            
            return response()->json($appointments);
        } catch (\Exception $e) {
            Log::error('Error en index appointments: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function nextAppointment() {
        try {
            $appointment = Appointment::where('user_id', Auth::id())
                ->where('date', '>=', now()->toDateString())
                ->where('status', '!=', 'cancelled')
                ->with(['pet', 'veterinarian'])
                ->orderBy('date', 'asc')
                ->orderBy('time', 'asc')
                ->first();
            
            return response()->json($appointment);
        } catch (\Exception $e) {
            Log::error('Error en nextAppointment: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request) {
        try {
            $data = $request->validate([
                'pet_id' => 'required',
                'date' => 'required|date',
                'time' => 'required',
                'type' => 'required',
                'veterinarian_id' => 'nullable',
                'notes' => 'nullable'
            ]);
            
            $data['user_id'] = Auth::id();
            $data['clinic_id'] = Auth::user()->clinic_id;
            $data['status'] = 'pending'; // Usar "pending" como en tu BD
            
            $appointment = Appointment::create($data);
            
            return response()->json($appointment, 201);
        } catch (\Exception $e) {
            Log::error('Error al crear cita: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, Appointment $appointment) {
        try {
            $request->validate([
                'pet_id' => 'required',
                'date' => 'required|date',
                'time' => 'required',
                'type' => 'required',
            ]);

            $appointment->update($request->all());
            return response()->json($appointment);
        } catch (\Exception $e) {
            Log::error('Error al actualizar cita: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, Appointment $appointment) {
        try {
            $user = $request->user();
            if ($user->id !== $appointment->user_id && !($user->hasRole('clinic_admin') && $user->clinic_id === $appointment->clinic_id)) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
            $appointment->delete();
            return response()->json(['message' => 'Cita eliminada correctamente']);
        } catch (\Exception $e) {
            Log::error('Error al eliminar cita: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // 🩺 MÉTODOS PARA VETERINARIOS
    // ==========================================
  public function completeAppointment(Request $request) {
        $request->validate([
            'appointment_id' => 'required',
            'diagnostico' => 'required|string',
            'peso' => 'required'
        ]);

        $appointment = Appointment::findOrFail($request->appointment_id);
        $appointment->status = 'completed';
        $appointment->diagnosis = $request->diagnostico;
        $appointment->weight = $request->peso;
        $appointment->save();

        return response()->json(['message' => 'Ficha guardada']);
    }

// En AppointmentController.php
     public function updateStatus(Request $request, $id) 
{
    try {
        $appointment = \App\Models\Appointment::findOrFail($id);
        
        // Validar que el nuevo estado sea válido
        $request->validate([
            'status' => 'required|in:pending,completed,cancelled'
        ]);

        $appointment->status = $request->status;
        $appointment->save();

        return response()->json([
            'message' => 'Estado actualizado con éxito',
            'status' => $appointment->status
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


    //para obtener nombres de mascotas
    public function getPatients(Request $request) {
    $user = Auth::user();
    
    // Traemos las mascotas (incluyendo la raza)
    $patients = \App\Models\Pet::with('user')->get()->map(function($pet) {
        return [
            'id' => $pet->id,
            'nombre' => $pet->name,
            'especie' => $pet->species,
            'raza' => $pet->breed, // <--- Asegúrate de que este campo exista en tu tabla 'pets'
            'dueno' => $pet->user->name ?? 'Sin dueño',
            // Buscamos la fecha de la última cita real
            'ultima_visita' => $pet->appointments()->latest()->first()?->date ?? 'Sin visitas'
        ];
    });
    return response()->json($patients);
}
    /**
     * Obtener agenda del veterinario (citas del día)
     * Usado por AgendaScreen.js
     */
    
    public function getVetAgenda(Request $request) {
        try {
            $user = Auth::user();
            $appointments = Appointment::where('clinic_id', $user->clinic_id)
                ->with(['user', 'pet'])
                ->orderBy('date', 'desc')
                ->get();

            return response()->json($appointments->map(function ($app) {
                return [
                    'id' => $app->id,
                    'date' => $app->date,
                    'time' => $app->time,
                    'hora_formateada' => substr($app->time, 0, 5),
                    'motivo' => $app->type,
                    'status' => $app->status ?? 'pending',
                    'diagnosis' => $app->diagnosis, // Campo en BD
                    'weight' => $app->weight,       // Campo en BD
                    'cliente' => ['name' => $app->user->name ?? 'Cliente'],
                    'mascota' => [
                        'nombre' => $app->pet->name ?? 'Mascota',
                        'especie' => $app->pet->species ?? 'N/A'
                    ],
                ];
            }));
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    // ==========================================
    // 🏥 MÉTODOS PARA ADMIN CLÍNICA
    // ==========================================
    
    public function getClinicAppointments(Request $request) {
        try {
            // Verificar que el usuario sea clinic_admin
            if (!$request->user()->hasRole('clinic_admin')) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            $clinicId = $request->user()->clinic_id;

            $appointments = Appointment::where('clinic_id', $clinicId)
                ->with(['user', 'pet', 'veterinarian'])
                ->orderBy('date', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'date' => $appointment->date,
                        'time' => $appointment->time,
                        'client_name' => $appointment->user->name,
                        'pet_name' => $appointment->pet->name,
                        'service' => $appointment->type,
                        'veterinarian_name' => $appointment->veterinarian?->name,
                        'status' => $appointment->status,
                    ];
                });

            return response()->json($appointments);
        } catch (\Exception $e) {
            Log::error('Error en getClinicAppointments: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}