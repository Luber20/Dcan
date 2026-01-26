<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MedicalBlock;
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

            // 1. ¿Ya está bloqueado? Lo borramos.
            $block = MedicalBlock::where('veterinarian_id', $vetId)->where('date', $date)->first();
            if ($block) {
                $block->delete();
                return response()->json(['message' => 'Día habilitado nuevamente']);
            }

            // 2. IMPORTANTE: Ajuste de nombres de tabla
            // Si tu tabla se llama 'citas', cambia 'appointments' por 'citas' abajo
            $hasCitas = DB::table('appointments') 
                ->where('veterinarian_id', $vetId)
                ->where('date', $date)
                ->exists();

            if ($hasCitas) {
                return response()->json(['message' => 'No puedes bloquear: hay citas agendadas'], 409);
            }

            // 3. Crear el bloqueo
            MedicalBlock::create([
                'veterinarian_id' => $vetId,
                'date' => $date,
                'reason' => 'Bloqueo manual'
            ]);

            return response()->json(['message' => 'Día bloqueado con éxito']);

        } catch (\Exception $e) {
            // Este mensaje aparecerá en tu Alert de React Native para decirnos qué falló
            return response()->json(['message' => 'Error en Laravel: ' . $e->getMessage()], 500);
        }
    }
}