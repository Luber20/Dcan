<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Creamos los 4 roles que necesitas
        Role::create(['name' => 'superadmin', 'guard_name' => 'api']);
        Role::create(['name' => 'clinic_admin', 'guard_name' => 'api']);
        Role::create(['name' => 'veterinarian', 'guard_name' => 'api']);
        Role::create(['name' => 'client', 'guard_name' => 'api']);
    }
}