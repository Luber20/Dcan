<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\PetController;
use App\Http\Controllers\Api\ClinicController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\AppointmentController;

// -------------------------------------------------------------------------
// RUTAS PÚBLICAS (No requieren token)
// -------------------------------------------------------------------------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-client', [RegisterController::class, 'registerClient']);

// -------------------------------------------------------------------------
// RUTAS PROTEGIDAS (Requieren Token "Bearer")
// -------------------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth y Perfil
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', function (Request $request) {
        return $request->user()->load('roles');
    });

    // Registro de veterinarios (solo clinic_admin)
    Route::post('/register-veterinarian', [RegisterController::class, 'registerVeterinarian']);

    // Menú y Mascotas
    Route::get('/my-menu', [MenuController::class, 'index']);
    Route::apiResource('pets', PetController::class);

    // 📅 RUTAS DE CITAS
    Route::get('/appointments/next', [AppointmentController::class, 'nextAppointment']);
    Route::apiResource('appointments', AppointmentController::class);

    // Gestión de clínica para admin
    Route::get('/clinic-clients', [ClinicController::class, 'getClients']);
    Route::post('/clinic-clients', [ClinicController::class, 'createClient']);
    Route::delete('/clinic-clients/{user}', [ClinicController::class, 'deleteClient']);
    Route::patch('/clinic-clients/{user}/toggle', [ClinicController::class, 'toggleClient']);
    Route::get('/clinic-veterinarians', [ClinicController::class, 'getVeterinarians']);
    Route::put('/clinic-veterinarians/{user}', [ClinicController::class, 'updateVeterinarian']);
    Route::delete('/clinic-veterinarians/{user}', [ClinicController::class, 'deleteVeterinarian']);
    Route::get('/clinic-appointments', [AppointmentController::class, 'getClinicAppointments']);
    Route::get('/veterinarians', function (Request $request) {
        $clinicId = $request->user()->clinic_id;

        // 1. Intentar obtener usuarios que tengan el ROL 'veterinarian'
        $vets = \App\Models\User::role('veterinarian')
            ->where('clinic_id', $clinicId)
            ->get();

        // 2. "Fail-safe": Si no hay nadie con ese rol (para pruebas), 
        // traemos a todos los usuarios de la clínica excepto al que consulta.
        if ($vets->isEmpty()) {
            return \App\Models\User::where('clinic_id', $clinicId)
                ->where('id', '!=', $request->user()->id)
                ->get();
        }

        return $vets;
    });

    // 👑 RUTAS PARA SUPER ADMIN
    Route::middleware(['role:super_admin'])->group(function () {
        Route::get('/admin/clinics', [ClinicController::class, 'index']);
        Route::post('/admin/clinics', [ClinicController::class, 'store']);
        Route::put('/admin/clinics/{clinic}', [ClinicController::class, 'update']);
        Route::patch('/admin/clinics/{clinic}/toggle', [ClinicController::class, 'toggle']);
    });
});