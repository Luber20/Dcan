<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'species', 'breed', 'gender', 
        'age', 'weight', 'vaccines', 'photo_url', 
        'user_id', 'clinic_id'
    ];

    // Relación: La mascota pertenece a un dueño (Usuario)
    public function user() {
        return $this->belongsTo(User::class);
    }

    // ✅ NUEVA RELACIÓN: La mascota tiene muchas citas
    // Esto es lo que arregla el Error 500
    public function appointments() {
        return $this->hasMany(Appointment::class);
    }
}