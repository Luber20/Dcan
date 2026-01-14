<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clinics', function (Blueprint $table) {
            $table->string('admin_email')->nullable()->after('phone');
            $table->string('ruc')->nullable()->after('admin_email');
            $table->string('hours')->nullable()->after('ruc');
        });
    }

    public function down(): void
    {
        Schema::table('clinics', function (Blueprint $table) {
            $table->dropColumn(['admin_email', 'ruc', 'hours']);
        });
    }
};
