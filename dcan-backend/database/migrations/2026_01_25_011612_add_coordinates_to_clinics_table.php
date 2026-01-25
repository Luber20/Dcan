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
            // ✅ VALIDACIÓN DE SEGURIDAD:
            // Solo agrega 'latitude' si no existe
            if (!Schema::hasColumn('clinics', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable();
            }

            // Solo agrega 'longitude' si no existe
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
        Schema::table('clinics', function (Blueprint $table) {
            // Para borrar, también verificamos si existen primero
            if (Schema::hasColumn('clinics', 'latitude')) {
                $table->dropColumn('latitude');
            }
            if (Schema::hasColumn('clinics', 'longitude')) {
                $table->dropColumn('longitude');
            }
        });
    }
};