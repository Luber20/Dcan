<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Availability extends Model
{
    use HasFactory;

    // Estos son los campos que permitimos guardar desde el formulario/App
    protected $fillable = [
        'user_id',
        'day',
        'start_time',
        'end_time',
        'lunch_start',
        'lunch_end',
        'is_active'
    ];

    /**
     * Relación: Esta disponibilidad pertenece a un Veterinario (Usuario)
     */
    public function veterinarian()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
