<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            
            // 1. Agregar teléfono si no existe
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable();
            }

            // 2. Agregar clinic_id si no existe
            if (!Schema::hasColumn('users', 'clinic_id')) {
                $table->unsignedBigInteger('clinic_id')->nullable(); // Nullable es clave
                // Opcional: Agregar llave foránea si quieres integridad estricta
                // $table->foreign('clinic_id')->references('id')->on('clinics')->onDelete('set null');
            } else {
                // Si ya existe, asegurarnos de que sea NULLABLE (Importante para SuperAdmins)
                $table->unsignedBigInteger('clinic_id')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        // No borramos nada para proteger datos
    }
};