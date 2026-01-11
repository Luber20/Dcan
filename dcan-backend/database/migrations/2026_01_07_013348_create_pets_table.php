<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up()
{
    Schema::create('pets', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('species'); // Si es "Otro", guardaremos lo que escriba
        $table->string('breed')->nullable();
        $table->string('gender');
        $table->string('age')->nullable(); // Ej: "2 años"
        $table->string('weight')->nullable(); // Ej: "12.5"
        $table->string('vaccines')->nullable(); // Ej: "Completo" o texto libre
        $table->string('photo_url')->nullable(); // 📸 Aquí guardaremos la ruta de la foto
        
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('clinic_id')->constrained()->onDelete('cascade');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pets');
    }
};
