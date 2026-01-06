<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use Illuminate\Http\Request;

class ClinicController extends Controller
{
    public function index()
    {
        // Lista clínicas (incluye inactivas)
        return response()->json(Clinic::orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone'   => 'nullable|string|max:50',
        ]);

        $clinic = Clinic::create($data + ['is_active' => true]);

        return response()->json([
            'message' => 'Clínica creada',
            'clinic' => $clinic
        ], 201);
    }

    public function update(Request $request, Clinic $clinic)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone'   => 'nullable|string|max:50',
        ]);

        $clinic->update($data);

        return response()->json([
            'message' => 'Clínica actualizada',
            'clinic' => $clinic
        ]);
    }

    public function toggle(Clinic $clinic)
    {
        $clinic->is_active = !$clinic->is_active;
        $clinic->save();

        return response()->json([
            'message' => $clinic->is_active ? 'Clínica activada' : 'Clínica inactivada',
            'clinic' => $clinic
        ]);
    }
}
