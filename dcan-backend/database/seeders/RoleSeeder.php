<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Limpiamos la caché de permisos (evita errores raros)
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Creamos los roles SIN especificar 'guard_name'.
        // Al quitarlo, Laravel usará 'web' por defecto, que es lo que pide tu error.
        
        // Usamos firstOrCreate para que no falle si lo ejecutas dos veces.
        
        Role::firstOrCreate(['name' => 'super_admin']); // Corregido para coincidir con tu App.js
        Role::firstOrCreate(['name' => 'clinic_admin']);
        Role::firstOrCreate(['name' => 'veterinarian']);
        Role::firstOrCreate(['name' => 'client']);
    }
}