<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClinicRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        // Datos de la solicitud
        'clinic_name',
        'province',
        'canton',
        'address',
        'phone',
        'email',
        'owner_name',
        'ruc',
        'notes',

        // Estados
        'status',         // pending_payment | pending_review | approved | rejected
        'reviewed_by',
        'reviewed_at',

        // ✅ Pago
        'public_token',       // token público
        'payment_status',     // unpaid | paid | refunded
        'amount',             // monto
        'currency',           // USD
        'payment_provider',   // stripe | payphone | paypal | manual
        'payment_reference',  // id del pago / referencia
        'paid_at',            // fecha pago
        'payment_proof_path', // 👈 ¡ESTE ES EL QUE FALTABA!
    ];
}