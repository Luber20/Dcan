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
    Schema::create('clinic_requests', function (Blueprint $table) {
        $table->id();
        $table->string('clinic_name');
        $table->string('province')->nullable();
        $table->string('canton')->nullable();
        $table->string('address')->nullable();
        $table->string('phone')->nullable();
        $table->string('email')->nullable();
        $table->string('owner_name')->nullable();
        $table->string('ruc')->nullable();
        $table->text('notes')->nullable();

        $table->string('status')->default('pending'); // pending | approved | rejected
        $table->unsignedBigInteger('reviewed_by')->nullable();
        $table->timestamp('reviewed_at')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down()
{
    Schema::dropIfExists('clinic_requests');
}

};
