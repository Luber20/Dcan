<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\MedicalBlock; 
use App\Models\Availability;
use App\Models\Pet; // Importante para getPatients
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
    public function show(Appointment $appointment) {
        try {
            // Cargar las relaciones para que no dé error en el frontend
            $appointment->load(['pet', 'veterinarian', 'user']);
            
            // Verificar que el usuario sea dueño de la cita o admin
            if (Auth::id() !== $appointment->user_id && !Auth::user()->hasRole('clinic_admin')) {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            return response()->json($appointment);
        } catch (\Exception $e) {
            Log::error('Error en show appointment: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function nextAppointment() {
        try {
            $appointment = Appointment::where('user_id', Auth::id())
                ->where('date', '>=', now()->toDateString())
                ->where('status', 'pending')
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
            $data['status'] = 'pending'; 
            
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
            'appointment_id' => 'required|exists:appointments,id',
            'diagnostico'    => 'required|string',
            'peso'           => 'required|numeric', 
            'temperatura'    => 'nullable|numeric',
            'tratamiento'    => 'nullable|string'
        ]);

        try {
            $appointment = Appointment::findOrFail($request->appointment_id);
            
            $appointment->status = 'completed';
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

    public function updateStatus(Request $request, $id) {
        try {
            $appointment = \App\Models\Appointment::findOrFail($id);
            
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

    // Obtener Pacientes (Filtrado por clínica para seguridad)
    public function getPatients(Request $request) {
        $user = Auth::user();

        // Filtramos por clinic_id para que no vea mascotas de otras clínicas
        $patients = \App\Models\Pet::where('clinic_id', $user->clinic_id)
            ->with(['user', 'appointments' => function($query) {
                $query->orderBy('date', 'desc'); 
            }])
            ->get()
            ->map(function($pet) {
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
                            'status' => $app->status, 
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

    public function getVetAgenda(Request $request) {
    try {
        $user = Auth::user();
        
        // 1. Cargamos la disponibilidad del veterinario de una vez para no hacer 100 consultas
        $availabilities = \App\Models\Availability::where('user_id', $user->id)
            ->where('is_active', true)
            ->get();

        $appointments = Appointment::where('clinic_id', $user->clinic_id)
            ->with(['user', 'pet'])
            ->orderBy('date', 'desc')
            ->orderBy('time', 'asc') // Ordenar también por hora para que la agenda sea clara
            ->get();

        $diasMap = [
            'Monday' => 'Lunes', 'Tuesday' => 'Martes', 'Wednesday' => 'Miercoles',
            'Thursday' => 'Jueves', 'Friday' => 'Viernes', 'Saturday' => 'Sabado', 'Sunday' => 'Domingo'
        ];

        return response()->json($appointments->map(function ($app) use ($availabilities, $diasMap) {
            // LÓGICA DE NIVELACIÓN:
            $dayName = \Carbon\Carbon::parse($app->date)->format('l');
            $diaBusqueda = $diasMap[$dayName] ?? null;
            
            // Buscamos si la cita hoy cumple con el horario actual
            $avail = $availabilities->where('day', $diaBusqueda)->first();
            
            $esFueraDeHorario = false;
            if ($avail) {
                $horaCita = substr($app->time, 0, 5); // "08:00"
                $inicio = substr($avail->start_time, 0, 5);
                $fin = substr($avail->end_time, 0, 5);
                
                // Si la cita es antes de que abra o después de que cierre actualmente
                $esFueraDeHorario = ($horaCita < $inicio || $horaCita >= $fin);
            }

            return [
                'id' => $app->id,
                'date' => $app->date,
                'time' => $app->time,
                'hora_formateada' => substr($app->time, 0, 5),
                'motivo' => $app->type,
                'status' => $app->status ?? 'pending',
                'diagnosis' => $app->diagnosis, 
                'weight' => $app->weight,       
                'notes' => $app->notes, 
                'fuera_de_horario' => $esFueraDeHorario, // <--- Bandera para el Frontend
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
    
    // Función que faltaba para ver historial específico
    public function getPetHistory($petId) {
        $appointments = Appointment::where('pet_id', $petId)
            ->orderBy('date', 'desc')
            ->get();
        return response()->json($appointments);
    }

    public function getAvailableSlots(Request $request) {
    try {
        $request->validate([
            'date' => 'required|date', 
            'veterinarian_id' => 'required'
        ]);

        $date = \Carbon\Carbon::parse($request->date)->format('Y-m-d');
        $vetId = $request->veterinarian_id;

        // 1. Bloqueos Médicos
        if (\App\Models\MedicalBlock::where('veterinarian_id', $vetId)->whereDate('date', $date)->exists()) {
            return response()->json([]); 
        }

        // 2. Mapeo de días y Disponibilidad
        $dayNameEn = \Carbon\Carbon::parse($date)->format('l');
        $diasMap = [
            'Monday' => 'Lunes', 'Tuesday' => 'Martes', 'Wednesday' => 'Miercoles',
            'Thursday' => 'Jueves', 'Friday' => 'Viernes', 'Saturday' => 'Sabado', 'Sunday' => 'Domingo'
        ];
        $diaBuscado = $diasMap[$dayNameEn] ?? null;

        $availability = \App\Models\Availability::where('user_id', $vetId)
            ->where('day', $diaBuscado)
            ->where('is_active', true)
            ->first();

        if (!$availability) return response()->json([]); 

        // 3. Citas ocupadas
        $occupiedSlots = \App\Models\Appointment::where('veterinarian_id', $vetId)
            ->whereDate('date', $date) 
            ->whereIn('status', ['pending', 'confirmed', 'completed']) 
            ->pluck('time')
            ->map(fn($time) => \Carbon\Carbon::parse($time)->format('H:i')) 
            ->toArray();

        // 4. CONFIGURACIÓN DE TIEMPO REAL (ECUADOR)
        // Obtenemos la hora exacta de ahora y le sumamos 2 horas
        $ahoraEcuador = \Carbon\Carbon::now('America/Guayaquil');
        $limiteReserva = (clone $ahoraEcuador)->addHours(2);

        $slots = [];
        // Importante: Creamos el inicio usando la fecha seleccionada para comparar objetos completos
        $inicio = \Carbon\Carbon::parse($date . ' ' . $availability->start_time, 'America/Guayaquil');
        $fin = \Carbon\Carbon::parse($date . ' ' . $availability->end_time, 'America/Guayaquil');
        
        $lunchStart = $availability->lunch_start ? \Carbon\Carbon::parse($availability->lunch_start)->format('H:i') : null;
        $lunchEnd = $availability->lunch_end ? \Carbon\Carbon::parse($availability->lunch_end)->format('H:i') : null;

        while ($inicio->lt($fin)) {
            $horaActualStr = $inicio->format('H:i');
            
            // CONDICIÓN 1: ¿Está ocupada?
            $estaOcupada = in_array($horaActualStr, $occupiedSlots);
            
            // CONDICIÓN 2: ¿Es hora de almuerzo?
            $esAlmuerzo = ($lunchStart && $lunchEnd) && ($horaActualStr >= $lunchStart && $horaActualStr < $lunchEnd);

            // CONDICIÓN 3: ¿El turno es al menos 2 horas después de "ahora"?
            // Esta es la clave: comparamos el objeto $inicio (fecha+hora del turno) contra el $limiteReserva
            $esValidoPorTiempo = $inicio->gt($limiteReserva);

            if (!$estaOcupada && !$esAlmuerzo && $esValidoPorTiempo) {
                $slots[] = $horaActualStr;
            }
            
            $inicio->addMinutes(30);
        }

        return response()->json($slots);

    } catch (\Exception $e) {
        \Log::error("Error en getAvailableSlots: " . $e->getMessage());
        return response()->json(['error' => 'Error interno'], 500);
    }
}
    
    // ==========================================
    // 🏥 MÉTODOS PARA ADMIN CLÍNICA
    // ==========================================
    
    public function getClinicAppointments(Request $request) {
        try {
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