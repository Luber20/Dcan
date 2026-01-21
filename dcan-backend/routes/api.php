<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\PetController;
use App\Http\Controllers\Api\ClinicController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\AvailabilityController; 

// ==========================================
// 🌍 RUTAS PÚBLICAS
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-client', [RegisterController::class, 'registerClient']);

Route::get('/clinics', [ClinicController::class, 'index']);
Route::get('/clinics/{clinic}', [ClinicController::class, 'show']);

Route::get('/veterinarians/{id}/availability', [AvailabilityController::class, 'getPublicAvailability']);

// ==========================================
// 🔐 RUTAS PROTEGIDAS (Sanctum)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::put('/profile/update', [AuthController::class, 'updateProfile']);
    Route::post('/profile/change-password', [AuthController::class, 'changePassword']);

    Route::get('/my-menu', [MenuController::class, 'index']);
    Route::apiResource('pets', PetController::class);

    // RUTAS PARA CLIENTES
    Route::get('/appointments/next', [AppointmentController::class, 'nextAppointment']);
    Route::apiResource('appointments', AppointmentController::class);
    Route::get('/appointments/available-slots', [AppointmentController::class, 'getAvailableSlots']);

    // ==========================================
    // 🩺 RUTAS PARA VETERINARIOS
    // ==========================================
    Route::middleware(['role:veterinarian|staff|veterinario'])->group(function () {
        
        // 1. Agenda y Pacientes
        Route::get('/veterinarian/appointments', [AppointmentController::class, 'getVetAgenda']);
        Route::get('/veterinarian/patients', [AppointmentController::class, 'getPatients']);
        
        // 2. Actualizar estados y completar ficha
        Route::post('/veterinarian/update-status/{id}', [AppointmentController::class, 'updateStatus']);
        Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']); 
        Route::post('/veterinarian/complete-appointment', [AppointmentController::class, 'completeAppointment']);
        
        // 3. Disponibilidad (Horarios)
        Route::post('/veterinarian/availability', [AvailabilityController::class, 'store']);
        Route::get('/veterinarian/availability', [AvailabilityController::class, 'index']);
        
        // 4. Historial mascota
        Route::get('/pets/{petId}/history', [AppointmentController::class, 'getPetHistory']);
    });

    // ==========================================
    // 🏥 RUTAS PARA ADMIN DE CLÍNICA
    // ==========================================
    Route::middleware(['role:clinic_admin|admin'])->group(function () {
        Route::put('/clinics/{clinic}', [ClinicController::class, 'update']);
        Route::post('/register-veterinarian', [RegisterController::class, 'registerVeterinarian']);
        
        Route::get('/clinic-clients', [ClinicController::class, 'getClients']);
        Route::post('/clinic-clients', [ClinicController::class, 'createClient']);
        Route::delete('/clinic-clients/{user}', [ClinicController::class, 'deleteClient']);
        Route::patch('/clinic-clients/{user}/toggle', [ClinicController::class, 'toggleClient']);

        Route::get('/clinic-veterinarians', [ClinicController::class, 'getVeterinarians']);
        Route::put('/clinic-veterinarians/{user}', [ClinicController::class, 'updateVeterinarian']);
        Route::delete('/clinic-veterinarians/{user}', [ClinicController::class, 'deleteVeterinarian']);

        Route::get('/clinic-appointments', [AppointmentController::class, 'getClinicAppointments']);
    });

    // Veterinarios disponibles (Lista general)
    Route::get('/veterinarians', function (Request $request) {
        $clinicId = $request->user()->clinic_id;
        $vets = \App\Models\User::role(['veterinarian', 'veterinario'])->where('clinic_id', $clinicId)->get();
        return $vets;
    });

    // ==========================================
    // 👑 SUPER ADMIN
    // ==========================================
    Route::middleware(['role:superadmin|super_admin'])->group(function () {
        
        // Gestión de Clínicas
        Route::get('/admin/clinics', [ClinicController::class, 'indexAdmin']); 
        Route::post('/admin/clinics', [ClinicController::class, 'store']);
        Route::put('/admin/clinics/{clinic}', [ClinicController::class, 'update']);
        Route::patch('/admin/clinics/{clinic}/toggle', [ClinicController::class, 'toggle']);
        
        // Dashboard Stats
        Route::get('/admin/dashboard', function () {
             return [
                 'clinics_total' => \App\Models\Clinic::count(),
                 'clinics_active' => \App\Models\Clinic::where('is_active', true)->count(),
                 'users_total' => \App\Models\User::count(),
             ];
        });
        
        // 👥 GESTIÓN DE USUARIOS (¡AQUÍ ESTABA EL FALTANTE!)
        Route::get('/admin/users', function () {
             return \App\Models\User::with('roles', 'clinic')->orderBy('id', 'desc')->get();
        });

        // ✅ ESTA LÍNEA ES LA QUE SOLUCIONA EL ERROR 405:
        // Permite crear usuarios (Dueños, Vets, Clientes) usando la función nueva
        Route::post('/admin/users', [RegisterController::class, 'registerAdminUser']);
        
        // Rutas para editar/eliminar usuarios desde SuperAdmin
        Route::put('/admin/users/{user}', [ClinicController::class, 'updateGlobalUser']);
        Route::delete('/admin/users/{user}', [ClinicController::class, 'deleteGlobalUser']);
        Route::patch('/admin/users/{user}/toggle', [ClinicController::class, 'toggleClient']);
    });
});