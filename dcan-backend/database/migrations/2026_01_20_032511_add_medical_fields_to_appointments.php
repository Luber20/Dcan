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
        Schema::table('appointments', function (Blueprint $table) {
            
            // VERIFICACIÓN DE SEGURIDAD:
            // Preguntamos: "¿Ya existe la columna 'diagnosis'?"
            // Si NO existe (!), entonces la creamos.
            if (!Schema::hasColumn('appointments', 'diagnosis')) {
                $table->text('diagnosis')->nullable()->after('status');
            }

            // Lo mismo para el peso
            if (!Schema::hasColumn('appointments', 'weight')) {
                $table->string('weight')->nullable()->after('diagnosis');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // No eliminamos nada aquí para evitar conflictos con la otra migración
            // que también maneja estas columnas.
        });
    }
};