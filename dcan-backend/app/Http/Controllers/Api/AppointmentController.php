<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller {
    
    public function index() {
        return Appointment::where('user_id', Auth::id())
            ->with(['pet', 'veterinarian'])
            ->orderBy('date', 'desc')
            ->get();
    }

    public function nextAppointment() {
        return Appointment::where('user_id', Auth::id())
            ->where('date', '>=', now()->toDateString())
            ->where('status', '!=', 'cancelled')
            ->with(['pet', 'veterinarian'])
            ->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->first();
    }

    public function store(Request $request) {
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
        return Appointment::create($data);
    }

    public function update(Request $request, Appointment $appointment) {
        // Validación básica
        $request->validate([
            'pet_id' => 'required',
            'date' => 'required|date',
            'time' => 'required',
            'type' => 'required',
        ]);

        $appointment->update($request->all());
        return response()->json($appointment);
    }

    public function destroy(Appointment $appointment) {
        $appointment->delete();
        return response()->json(['message' => 'Cita eliminada correctamente']);
    }
}