<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('clinics', function (Blueprint $table) {
            if (!Schema::hasColumn('clinics', 'ruc')) {
                $table->string('ruc')->nullable();
            }
            if (!Schema::hasColumn('clinics', 'hours')) {
                $table->string('hours')->nullable();
            }
        });
    }

    public function down(): void {
        // En SQLite, dropColumn puede ser delicado; déjalo vacío para evitar errores en rollback.
    }
};
