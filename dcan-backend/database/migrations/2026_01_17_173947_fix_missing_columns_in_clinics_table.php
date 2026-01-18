<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clinics', function (Blueprint $table) {
            
            // 1. Teléfono
            if (!Schema::hasColumn('clinics', 'phone')) {
                $table->string('phone')->nullable();
            }

            // 2. Dirección
            if (!Schema::hasColumn('clinics', 'address')) {
                $table->string('address')->nullable();
            }

            // 3. Horarios
            if (!Schema::hasColumn('clinics', 'hours')) {
                $table->string('hours')->nullable();
            }

            // 4. Foto (URL)
            if (!Schema::hasColumn('clinics', 'photo_url')) {
                $table->string('photo_url')->nullable();
            }

            // 5. Descripción
            if (!Schema::hasColumn('clinics', 'description')) {
                $table->text('description')->nullable();
            }

            // 6. Campos de ubicación
            if (!Schema::hasColumn('clinics', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable();
            }
            if (!Schema::hasColumn('clinics', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No hacemos nada en el down para evitar borrar datos accidentalmente
    }
};