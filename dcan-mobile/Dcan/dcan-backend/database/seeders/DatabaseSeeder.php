<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Llamamos a todos los seeders en ORDEN ESTRICTO
        $this->call([
            RoleSeeder::class,   // 1. Roles (Primero, para que existan)
            ClinicSeeder::class, // 2. Clínicas
            MenuSeeder::class,   // 3. Menús (Busca roles creados en el paso 1)
            UserSeeder::class,   // 4. Usuarios de prueba
        ]);
    }
}