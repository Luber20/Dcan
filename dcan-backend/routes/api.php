<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Clinic;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\PetController;
use App\Http\Controllers\Api\ClinicController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\AppointmentController;

// ==========================================
// 🌍 RUTAS PÚBLICAS
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-client', [RegisterController::class, 'registerClient']);

Route::get('/clinics', [ClinicController::class, 'index']);
Route::get('/clinics/{clinic}', [ClinicController::class, 'show']);

// ==========================================
// 🔐 RUTAS PROTEGIDAS (Sanctum)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {

    // Auth y Perfil
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::put('/profile/update', [AuthController::class, 'updateProfile']);
    Route::post('/profile/change-password', [AuthController::class, 'changePassword']);

    // Menú y Mascotas
    Route::get('/my-menu', [MenuController::class, 'index']);
    Route::apiResource('pets', PetController::class);

    // Citas
    Route::get('/appointments/next', [AppointmentController::class, 'nextAppointment']);
    Route::apiResource('appointments', AppointmentController::class);

    // ✅ ACTUALIZAR MI CLÍNICA (Ruta para el Dueño)
    Route::put('/clinics/{clinic}', [ClinicController::class, 'update']);

    // Gestión de Personal y Clientes (Para Admin Clínica)
    Route::post('/register-veterinarian', [RegisterController::class, 'registerVeterinarian']);
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
        $vets = \App\Models\User::role('veterinarian')->where('clinic_id', $clinicId)->get();
        return $vets->isEmpty() ? \App\Models\User::where('clinic_id', $clinicId)->where('id', '!=', $request->user()->id)->get() : $vets;
    });

    // ==========================================
    // 👑 SUPER ADMIN (Gestión Global)
    // ==========================================
    Route::middleware(['role:superadmin|super_admin'])->group(function () {
        
        // 🏥 Gestión Clínicas
        Route::get('/admin/clinics', [ClinicController::class, 'indexAdmin']); 
        Route::post('/admin/clinics', [ClinicController::class, 'store']);
        Route::put('/admin/clinics/{clinic}', [ClinicController::class, 'update']); // Editar info clínica
        Route::patch('/admin/clinics/{clinic}/toggle', [ClinicController::class, 'toggle']);
        
        // 📊 Dashboard Stats
        Route::get('/admin/dashboard', function () {
             return [
                 'clinics_total' => \App\Models\Clinic::count(),
                 'clinics_active' => \App\Models\Clinic::where('is_active', true)->count(),
                 'clinics_pending' => \App\Models\Clinic::where('is_active', false)->count(),
                 'users_total' => \App\Models\User::count(),
                 'clients_total' => \App\Models\User::role('client')->count(),
             ];
        });
        
        // 👥 Gestión Usuarios (CORREGIDO)
        Route::get('/admin/users', function () {
             return \App\Models\User::with('roles', 'clinic')->orderBy('id', 'desc')->get();
        });
        
        // Crear
        Route::post('/admin/users', [RegisterController::class, 'registerClient']); // Puedes mejorar esto luego para crear admin/vets directos
        
        // ✅ Editar (Usar updateGlobalUser para poder cambiar password y rol)
        Route::put('/admin/users/{user}', [ClinicController::class, 'updateGlobalUser']);
        
        // ✅ Eliminar (Usar deleteGlobalUser)
        Route::delete('/admin/users/{user}', [ClinicController::class, 'deleteGlobalUser']);
        
        // Bloquear/Activar
        Route::patch('/admin/users/{user}/toggle', [ClinicController::class, 'toggleClient']); // Reutilizamos toggleClient que ya hace soft delete/restore
        
        // 📩 Solicitudes (Opcional)
        Route::get('/admin/clinic-requests', function () {
             return \App\Models\Clinic::where('is_active', false)->get();
        });
        Route::post('/admin/clinic-requests/{clinic}/approve', [ClinicController::class, 'toggle']);
        Route::post('/admin/clinic-requests/{clinic}/reject', function (\App\Models\Clinic $clinic) {
            $clinic->delete();
            return response()->json(['message' => 'Solicitud rechazada']);
        });
    });
});