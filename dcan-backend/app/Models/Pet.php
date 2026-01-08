<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = [
    'name', 'species', 'breed', 'gender', 
    'age', 'weight', 'vaccines', 'photo_url', // 👈 Agregamos los nuevos
    'user_id', 'clinic_id'
    ];

    // Relación inversa (opcional, buena práctica)
    public function user() {
        return $this->belongsTo(User::class);
    }
}