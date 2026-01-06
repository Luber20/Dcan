<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RegisterController;

// Rutas públicas (login y register sin autenticación)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/register-client', [RegisterController::class, 'registerClient']);


// Rutas protegidas (necesitan el token Bearer)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('/admin/clinics', [ClinicController::class, 'index']);
    Route::post('/admin/clinics', [ClinicController::class, 'store']);
    Route::put('/admin/clinics/{clinic}', [ClinicController::class, 'update']);
    Route::patch('/admin/clinics/{clinic}/toggle', [ClinicController::class, 'toggle']);
});

});