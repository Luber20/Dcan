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
    Schema::table('clinic_requests', function (Blueprint $table) {
        $table->string('public_token')->nullable()->unique()->after('id');

        $table->string('payment_status')->default('unpaid')->after('status'); // unpaid|paid|refunded
        $table->decimal('amount', 8, 2)->default(0)->after('payment_status');
        $table->string('currency', 10)->default('USD')->after('amount');

        $table->string('payment_provider')->nullable()->after('currency');  // stripe|payphone|paypal|manual
        $table->string('payment_reference')->nullable()->after('payment_provider');
        $table->timestamp('paid_at')->nullable()->after('payment_reference');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down()
{
    Schema::table('clinic_requests', function (Blueprint $table) {
        $table->dropColumn([
            'public_token',
            'payment_status',
            'amount',
            'currency',
            'payment_provider',
            'payment_reference',
            'paid_at',
        ]);
    });
}

};
