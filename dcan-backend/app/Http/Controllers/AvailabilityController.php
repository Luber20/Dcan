<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Availability;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AvailabilityController extends Controller
{
    /**
     * Carga la disponibilidad para el usuario autenticado (Veterinario/Staff)
     */
    public function index()
    {
        try {
            $userId = Auth::id();
            
            // Obtenemos todos los registros de este usuario
            $availability = Availability::where('user_id', $userId)->get();

            if ($availability->isEmpty()) {
                return response()->json(['dias' => null]);
            }

            // Transformamos el formato de la base de datos al formato del JSON de React Native
            $formatoFrontend = [];
            foreach ($availability as $item) {
                $formatoFrontend[$item->day] = [
                    'activo'          => (bool)$item->is_active,
                    'inicio'          => substr($item->start_time, 0, 5), // '09:00:00' -> '09:00'
                    'fin'             => substr($item->end_time, 0, 5),
                    'almuerzo_inicio' => substr($item->lunch_start, 0, 5),
                    'almuerzo_fin'    => substr($item->lunch_end, 0, 5),
                ];
            }

            return response()->json(['dias' => $formatoFrontend]);

        } catch (\Exception $e) {
            Log::error("Error al obtener disponibilidad: " . $e->getMessage());
            return response()->json(['message' => 'Error al cargar datos'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $userId = auth()->id(); 
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
        $availability = Availability::where('user_id', $id)
            ->where('is_active', true)
            ->get()
            ->keyBy('day');
            
        return response()->json($availability);
    }
}