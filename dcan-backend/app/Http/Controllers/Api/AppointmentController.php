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
    // 1. Validamos los campos. 
    // Nota: 'diagnostico' es como viene desde React, 'diagnosis' es como se llama en la DB.
    $request->validate([
        'appointment_id' => 'required|exists:appointments,id',
        'diagnostico'    => 'required|string',
        'peso'           => 'required|numeric', 
        'temperatura'    => 'nullable|numeric',
        'tratamiento'    => 'nullable|string'
    ]);

    try {
        $appointment = Appointment::findOrFail($request->appointment_id);
        
        // 2. Cambiamos el estado a completado
        $appointment->status = 'completed';
        
        // 3. Guardamos los datos médicos en las columnas de la BD (en inglés)
        $appointment->diagnosis   = $request->diagnostico;
        $appointment->weight      = $request->peso;
        $appointment->temperature = $request->temperatura;
        $appointment->treatment   = $request->tratamiento;
        
        $appointment->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Ficha médica guardada y cita finalizada con éxito.'
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Error al guardar la ficha: ' . $e->getMessage()
        ], 500);
    }
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
    // Quitamos el ->where('status', 'completed') de aquí adentro
    $patients = \App\Models\Pet::with(['user', 'appointments' => function($query) {
        // Solo ordenamos, NO filtramos por estado aquí para que incluya 'cancelled'
        $query->orderBy('date', 'desc'); 
    }])->get()->map(function($pet) {
        return [
            'id' => $pet->id,
            'nombre' => $pet->name,
            'especie' => $pet->species,
            'raza' => $pet->breed,
            'edad' => $pet->age,
            'sexo' => $pet->gender,
            'dueno' => $pet->user->name ?? 'Sin dueño',
            'appointments' => $pet->appointments->map(function($app) {
                return [
                    'id' => $app->id,
                    'date' => $app->date,
                    'type' => $app->type,
                    'status' => $app->status, // <--- Esto ahora enviará 'cancelled' o 'completed'
                    'diagnosis' => $app->diagnosis, 
                    'weight' => $app->weight,
                    'temperatura' => $app->temperature, 
                    'tratamiento' => $app->treatment,
                ];
            })
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
                'diagnosis' => $app->diagnosis, 
                'weight' => $app->weight,       
                'notes' => $app->notes, // <--- ¡ESTA LÍNEA FALTABA!
                'cliente' => ['name' => $app->user->name ?? 'Cliente'],
                'mascota' => [
                    'nombre' => $app->pet->name ?? 'Mascota',
                    'especie' => $app->pet->species ?? 'N/A',
                    'edad' => $app->pet->age ?? 'No registrada', 
                    'sexo' => $app->pet->gender ?? 'No especificado'
                ],
            ];
        }));
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
     public function getAvailableSlots(Request $request)
{
    $request->validate([
        'date' => 'required|date', // Formato YYYY-MM-DD
        'veterinarian_id' => 'required|exists:users,id'
    ]);

    $date = $request->date;
    $vetId = $request->veterinarian_id;

    // 1. Obtener el nombre del día en español para tu tabla
    $dayNameEn = \Carbon\Carbon::parse($date)->format('l');
    $diasMap = [
        'Monday' => 'Lunes', 'Tuesday' => 'Martes', 'Wednesday' => 'Miercoles',
        'Thursday' => 'Jueves', 'Friday' => 'Viernes', 'Saturday' => 'Sabado', 'Sunday' => 'Domingo'
    ];
    $diaBuscado = $diasMap[$dayNameEn];

    // 2. Obtenemos la configuración BASE del veterinario para ese día de la semana
    $availability = \App\Models\Availability::where('user_id', $vetId)
        ->where('day', $diaBuscado)
        ->where('is_active', true)
        ->first();

    if (!$availability) {
        return response()->json([]); // No atiende este día de la semana (ej. Domingos)
    }

    // 3. Obtenemos las citas OCUPADAS específicamente para ESTE DÍA (ej. solo el 21 de enero)
    // Usamos whereDate para asegurar que no se filtren otros miércoles
    $occupiedSlots = \App\Models\Appointment::where('veterinarian_id', $vetId)
        ->whereDate('date', $date) 
        ->whereIn('status', ['pending', 'confirmed', 'completed']) // No incluimos 'cancelled' o 'no-show'
        ->pluck('time')
        ->map(fn($time) => substr($time, 0, 5))
        ->toArray();

    // 4. Generamos los intervalos de 30 minutos
    $slots = [];
    $inicio = \Carbon\Carbon::parse($availability->start_time);
    $fin = \Carbon\Carbon::parse($availability->end_time);
    
    // Almuerzo (de tu tabla)
    $lunchStart = \Carbon\Carbon::parse($availability->lunch_start);
    $lunchEnd = \Carbon\Carbon::parse($availability->lunch_end);

    while ($inicio->lt($fin)) {
        $horaActual = $inicio->format('H:i');
        $objActual = \Carbon\Carbon::parse($horaActual);

        // REGLA 1: No debe estar ocupado en la fecha específica ($date)
        $estaLibre = !in_array($horaActual, $occupiedSlots);

        // REGLA 2: No debe estar en el rango de almuerzo
        $esHoraAlmuerzo = $objActual->greaterThanOrEqualTo($lunchStart) && $objActual->lessThan($lunchEnd);

        if ($estaLibre && !$esHoraAlmuerzo) {
            $slots[] = $horaActual;
        }

        $inicio->addMinutes(30);
    }

    return response()->json($slots);
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