<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalBlock extends Model
 {
    protected $fillable = ['veterinarian_id', 'date', 'reason'];

    // Esto obliga a Laravel a tratar 'date' siempre como una fecha limpia (YYYY-MM-DD)
    protected $casts = [
        'date' => 'date:Y-m-d',
    ];
 }