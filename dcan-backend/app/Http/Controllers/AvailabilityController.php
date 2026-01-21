<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Availability;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AvailabilityController extends Controller
{
    /**
     * Carga la disponibilidad. Si no existe, devuelve defaults.
     */
    public function index()
    {
        try {
            $userId = Auth::id();
            
            // Obtenemos los registros de la BD y los organizamos por día (keyBy)
            $availability = Availability::where('user_id', $userId)->get()->keyBy('day');

            // Lista de días que la App espera recibir SÍ o SÍ
            $diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
            $response = [];

            foreach ($diasSemana as $dia) {
                // CASO A: Ya existe configuración en la BD
                if (isset($availability[$dia])) {
                    $item = $availability[$dia];
                    $response[$dia] = [
                        'activo'          => (bool)$item->is_active,
                        'inicio'          => substr($item->start_time, 0, 5),
                        'fin'             => substr($item->end_time, 0, 5),
                        'almuerzo_inicio' => substr($item->lunch_start, 0, 5),
                        'almuerzo_fin'    => substr($item->lunch_end, 0, 5),
                    ];
                } 
                // CASO B: Usuario nuevo (No tiene registro), enviamos DEFAULT
                else {
                    // Por defecto activamos Lunes a Viernes
                    $esLaborable = !in_array($dia, ['Sabado', 'Domingo']);
                    
                    $response[$dia] = [
                        'activo'          => $esLaborable,
                        'inicio'          => '09:00',
                        'fin'             => '18:00',
                        'almuerzo_inicio' => '12:00',
                        'almuerzo_fin'    => '13:00',
                    ];
                }
            }

            return response()->json(['dias' => $response]);

        } catch (\Exception $e) {
            Log::error("Error al obtener disponibilidad: " . $e->getMessage());
            return response()->json(['message' => 'Error al cargar datos'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $userId = Auth::id(); 
            $dias = $request->input('dias');

            if (!$dias) {
                return response()->json(['message' => 'No se enviaron datos'], 400);
            }

            foreach ($dias as $nombreDia => $config) {
                Availability::updateOrCreate(
                    ['user_id' => $userId, 'day' => $nombreDia],
                    [
                        'start_time'  => $config['inicio'],
                        'end_time'    => $config['fin'],
                        'lunch_start' => $config['almuerzo_inicio'] ?? '12:00',
                        'lunch_end'   => $config['almuerzo_fin'] ?? '13:00',
                        'is_active'   => filter_var($config['activo'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0
                    ]
                );
            }
            return response()->json(['message' => 'Configuración guardada con éxito']);
            
        } catch (\Exception $e) {
            Log::error("Error en Availability: " . $e->getMessage());
            return response()->json([
                'message' => 'Error en el servidor', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getPublicAvailability($id)
    {
        // Esta función es para que los CLIENTES vean el horario
        $availability = Availability::where('user_id', $id)
            ->where('is_active', true)
            ->get()
            ->keyBy('day');
            
        return response()->json($availability);
    }
}