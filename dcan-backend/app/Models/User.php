<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\SoftDeletes;
// Importamos los modelos relacionados para evitar errores
use App\Models\Clinic;
use App\Models\Pet;
use App\Models\Appointment;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    /**
     * Los atributos que se pueden asignar masivamente.
     * ¡clinic_id DEBE estar aquí para que funcione el registro!
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'clinic_id', // <--- IMPORTANTE
        'phone',
        'is_active',
        'specialty',   // Nuevo
        'bio',         // Nuevo
        'photo_path' // Nuevo
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relaciones
    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    public function pets()
    {
        return $this->hasMany(Pet::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}