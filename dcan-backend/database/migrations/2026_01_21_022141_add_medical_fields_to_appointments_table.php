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
        // Solo agregamos las que NO existen según tu error anterior
        if (!Schema::hasColumn('appointments', 'weight')) {
            $table->decimal('weight', 8, 2)->nullable();
        }
        if (!Schema::hasColumn('appointments', 'temperature')) {
            $table->decimal('temperature', 8, 2)->nullable();
        }
        if (!Schema::hasColumn('appointments', 'treatment')) {
            $table->text('treatment')->nullable();
        }
        // 'diagnosis' ya existe, así que no lo ponemos aquí
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            //
        });
    }
};
