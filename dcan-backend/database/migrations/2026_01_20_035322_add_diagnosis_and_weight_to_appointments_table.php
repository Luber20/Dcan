<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('appointments', function (Blueprint $table) {
            // VERIFICACIÓN: Solo agregamos si no existen
            if (!Schema::hasColumn('appointments', 'diagnosis')) {
                $table->text('diagnosis')->nullable();
            }
            
            if (!Schema::hasColumn('appointments', 'weight')) {
                $table->string('weight')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // No borramos nada para no romper las otras migraciones
        });
    }
};