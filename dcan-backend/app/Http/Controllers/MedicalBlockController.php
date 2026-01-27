<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MedicalBlock;
use App\Models\Appointment; // Asegúrate de importar el modelo
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MedicalBlockController extends Controller
{
    public function index() {
        return response()->json(MedicalBlock::where('veterinarian_id', Auth::id())->get());
    }

    public function toggleBlock(Request $request) {
        try {
            $date = $request->date;
            $vetId = Auth::id();

            // 1. ¿Ya existe el bloqueo? Si existe, lo quitamos (Desbloquear).
            $block = MedicalBlock::where('veterinarian_id', $vetId)
                                 ->whereDate('date', $date)
                                 ->first();

            if ($block) {
                $block->delete();
                return response()->json(['message' => 'Día habilitado nuevamente']);
            }

            // 2. VALIDACIÓN: ¿Hay citas agendadas ese día?
            // Usamos whereDate para evitar problemas con horas (00:00:00)
            // Solo contamos citas que NO estén canceladas.
            $hasCitas = Appointment::where('veterinarian_id', $vetId)
                ->whereDate('date', $date)
                ->whereIn('status', ['pending', 'confirmed']) 
                ->exists();

            if ($hasCitas) {
                // Código 409 o 400 para que React Native detecte error
                return response()->json([
                    'message' => 'No puedes bloquear este día: existen citas pendientes o confirmadas.'
                ], 400); 
            }

            // 3. Crear el bloqueo si el día está limpio
            MedicalBlock::create([
                'veterinarian_id' => $vetId,
                'date' => $date,
                'reason' => 'Bloqueo manual'
            ]);

            return response()->json(['message' => 'Día bloqueado con éxito']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}