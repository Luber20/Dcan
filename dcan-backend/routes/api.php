<?php

use Illuminate\Http\Request;
use App\Http\Controllers\MedicalBlockController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\PetController;
use App\Http\Controllers\Api\ClinicController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\Api\CatalogController; // Asegúrate de importar esto
use App\Http\Controllers\Api\ClinicRequestController;


// ==========================================
// 🌍 RUTAS PÚBLICAS
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-client', [RegisterController::class, 'registerClient']);

Route::get('/clinics', [ClinicController::class, 'index']);
Route::get('/clinics/{clinic}', [ClinicController::class, 'show']);

Route::get('/veterinarians/{id}/availability', [AvailabilityController::class, 'getPublicAvailability']);

Route::get('/catalogs', [CatalogController::class, 'index']);
Route::post('/clinic-requests', [ClinicRequestController::class, 'store']);


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

    // ✅ NUEVA RUTA: PARA QUE EL VETERINARIO VEA LA FICHA (QR)
    Route::get('/vet/pets/{id}', [PetController::class, 'showForVet']);

    // RUTAS PARA CLIENTES
    Route::get('/appointments/next', [AppointmentController::class, 'nextAppointment']);
    
    Route::get('/appointments/available-slots', [AppointmentController::class, 'getAvailableSlots']);

    Route::apiResource('appointments', AppointmentController::class);

    // ==========================================
    // 🩺 RUTAS PARA VETERINARIOS
    // ==========================================
    // ✅ No se elimina nada: solo se quitan roles inexistentes que causaban 500.
    Route::middleware(['role:veterinarian'])->group(function () {
        // --- NUEVAS RUTAS DE PERFIL PROFESIONAL ---
    Route::get('/veterinarian/profile', [App\Http\Controllers\Api\VeterinarianController::class, 'getProfile']);
    Route::post('/veterinarian/profile/update', [App\Http\Controllers\Api\VeterinarianController::class, 'updateProfile']);

        // Rutas para bloqueos médicos
        Route::get('/veterinarian/blocks', [MedicalBlockController::class, 'index']);
        Route::post('/veterinarian/blocks/toggle', [MedicalBlockController::class, 'toggleBlock']);

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
    // ✅ Mantiene el bloque, solo se ajusta a rol real (clinic_admin) para evitar 500 por rol inexistente "admin".
    Route::middleware(['role:clinic_admin'])->group(function () {

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
    // ✅ Corrección: solo usa el rol real "veterinarian" y permite filtrar por clinic_id via query.
    Route::get('/veterinarians', function (Request $request) {

        $clinicId = $request->query('clinic_id') ?? $request->user()->clinic_id;

        if (!$clinicId) return response()->json([]);

        return \App\Models\User::role('veterinarian')
            ->where('clinic_id', (int)$clinicId)
            ->get();
    });

    // ==========================================
    // 👑 SUPER ADMIN
    // ==========================================
    // ✅ Mantiene el bloque, solo se ajusta al rol real (superadmin) para evitar 500 por rol inexistente "super_admin".
    Route::middleware(['role:superadmin'])->group(function () {

        Route::patch('/admin/clinic-requests/{id}/mark-paid', [ClinicRequestController::class, 'markPaid']);

        // ✅ Solicitudes de clínicas
        Route::get('/admin/clinic-requests', [ClinicRequestController::class, 'index']);
        Route::patch('/admin/clinic-requests/{id}/approve', [ClinicRequestController::class, 'approve']);
        Route::patch('/admin/clinic-requests/{id}/reject', [ClinicRequestController::class, 'reject']);

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

        // 👥 GESTIÓN DE USUARIOS
        Route::get('/admin/users', function () {
            return \App\Models\User::with('roles', 'clinic')->orderBy('id', 'desc')->get();
        });

        Route::post('/admin/users', [RegisterController::class, 'registerAdminUser']);

        Route::put('/admin/users/{user}', [ClinicController::class, 'updateGlobalUser']);
        Route::delete('/admin/users/{user}', [ClinicController::class, 'deleteGlobalUser']);
        Route::patch('/admin/users/{user}/toggle', [ClinicController::class, 'toggleClient']);

        // Catálogos
        Route::post('/admin/species', [CatalogController::class, 'storeSpecies']);
        Route::delete('/admin/species/{id}', [CatalogController::class, 'deleteSpecies']);

        Route::post('/admin/breeds', [CatalogController::class, 'storeBreed']);
        Route::delete('/admin/breeds/{id}', [CatalogController::class, 'deleteBreed']);
    });
});
