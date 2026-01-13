<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
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

        // 2. Creamos los permisos
        $permissions = [
            // Gestión de la Clínica
            'edit_clinic',
            'manage_services',
            'manage_specialties',
            'toggle_services',
            'create_custom_services',
            // Gestión de Personal
            'create_veterinarian',
            'edit_staff',
            'generate_credentials',
            // Gestión de Clientes
            'view_client_basic',
            'view_client_activity',
            // Gestión de Citas
            'view_all_appointments',
            'manage_appointments', // Agregado para editar citas
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // 3. Creamos los roles
        Role::firstOrCreate(['name' => 'super_admin']);
        Role::firstOrCreate(['name' => 'clinic_admin']);
        Role::firstOrCreate(['name' => 'veterinarian']);
        Role::firstOrCreate(['name' => 'client']);

        // 4. Asignamos permisos a clinic_admin
        $clinicAdmin = Role::where('name', 'clinic_admin')->first();
        $clinicAdmin->givePermissionTo($permissions);

        // 5. Asignamos todos los permisos a super_admin
        $superAdmin = Role::where('name', 'super_admin')->first();
        $superAdmin->givePermissionTo(Permission::all());
    }
}