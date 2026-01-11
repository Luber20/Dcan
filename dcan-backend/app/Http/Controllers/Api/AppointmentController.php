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

    public function destroy(Request $request, Appointment $appointment) {
        $user = $request->user();
        if ($user->id !== $appointment->user_id && !($user->hasRole('clinic_admin') && $user->clinic_id === $appointment->clinic_id)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $appointment->delete();
        return response()->json(['message' => 'Cita eliminada correctamente']);
    }

    public function getClinicAppointments(Request $request) {
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
    }
}