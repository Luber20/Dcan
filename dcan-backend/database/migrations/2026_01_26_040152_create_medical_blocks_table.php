<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint; // ✅ Verifica que esta línea esté
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // El error está aquí: pusiste (Schema $table) y debe ser (Blueprint $table)
        Schema::create('medical_blocks', function (Blueprint $table) { 
            $table->id();
            $table->foreignId('veterinarian_id')->constrained('users')->onDelete('cascade');
            $table->date('date'); 
            $table->string('reason')->nullable();
            $table->timestamps();

            // Esto asegura que un veterinario no bloquee dos veces el mismo día
            $table->unique(['veterinarian_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_blocks');
    }
};