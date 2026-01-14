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
    ];
}
