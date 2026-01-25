<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clinic extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'province',
        'canton',
        'address',
        'phone',
        'admin_email',
        'ruc',
        'hours',
        'is_active',
        // ✅ Agregamos estos por si acaso los usas a futuro para las fotos
        'photo_url', 
        'description',
        'latitude',
        'longitude',
    ];

    // Esto asegura que los tipos de datos sean correctos
    protected $casts = [
        'is_active' => 'boolean',
    ];
}