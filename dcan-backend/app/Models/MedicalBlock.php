<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalBlock extends Model
{
    // Esto es vital para que no salga "error al guardar"
    protected $fillable = ['veterinarian_id', 'date', 'reason'];
}