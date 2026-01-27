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
            
            // Obtenemos los registros y los organizamos por día
            $availability = Availability::where('user_id', $userId)->get()->keyBy('day');

            $diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
            $response = [];

            foreach ($diasSemana as $dia) {
                if (isset($availability[$dia])) {
                    $item = $availability[$dia];
                    $response[$dia] = [
                        'activo'          => (bool)$item->is_active,
                        // Añadimos verificación de nulos antes del substr para evitar errores
                        'inicio'          => $item->start_time ? substr($item->start_time, 0, 5) : '09:00',
                        'fin'             => $item->end_time ? substr($item->end_time, 0, 5) : '18:00',
                        'almuerzo_inicio' => $item->lunch_start ? substr($item->lunch_start, 0, 5) : '12:00',
                        'almuerzo_fin'    => $item->lunch_end ? substr($item->lunch_end, 0, 5) : '13:00',
                    ];
                } 
                else {
                    // Valores por defecto para días sin registro
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

    /**
     * Guarda la configuración masiva enviada desde la App.
     */
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
                        'start_time'  => $config['inicio'] ?? '09:00',
                        'end_time'    => $config['fin'] ?? '18:00',
                        'lunch_start' => $config['almuerzo_inicio'] ?? '12:00',
                        'lunch_end'   => $config['almuerzo_fin'] ?? '13:00',
                        // Aseguramos que el booleano se guarde como 1 o 0
                        'is_active'   => (isset($config['activo']) && $config['activo']) ? 1 : 0
                    ]
                );
            }

            return response()->json(['message' => 'Configuración guardada con éxito']);
            
        } catch (\Exception $e) {
            Log::error("Error en Availability Store: " . $e->getMessage());
            return response()->json([
                'message' => 'Error en el servidor', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vista pública para el cliente al elegir horarios.
     */
    public function getPublicAvailability($id)
    {
        $availability = Availability::where('user_id', $id)
            ->where('is_active', true)
            ->get()
            ->keyBy('day');
            
        return response()->json($availability);
    }
}