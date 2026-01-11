<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabla de Menús
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name');         // Texto a mostrar (Ej: "Mascotas")
            $table->string('icon');         // Icono Ionicons (Ej: "paw")
            $table->string('screen_name');  // Clave para que React sepa qué pantalla abrir
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Tabla Pivote (Roles <-> Menús)
        Schema::create('menu_role', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id'); 
            $table->foreignId('menu_id')->constrained()->onDelete('cascade');
            
            // Relación con la tabla roles de Spatie
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_role');
        Schema::dropIfExists('menus');
    }
};