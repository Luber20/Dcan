<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id', 
        'user_id', 
        'pet_id', 
        'veterinarian_id', 
        'date', 
        'time', 
        'status', 
        'type', 
        'notes'
    ];

    // Relación: La cita pertenece a una mascota
    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    // Relación: La cita pertenece a un usuario (dueño)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación: La cita tiene un veterinario asignado
    public function veterinarian()
    {
        return $this->belongsTo(User::class, 'veterinarian_id');
    }

    // Relación: La cita pertenece a una clínica
    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }
}