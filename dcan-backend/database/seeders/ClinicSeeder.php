<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClinicSeeder extends Seeder
{
    public function run()
    {
        // Vaciamos la tabla para evitar duplicados y reiniciamos los IDs
        // NOTA: En Postgres, para reiniciar el ID a 1 se usa truncate cascade o alter sequence.
        // Para simplificar en pruebas, simplemente borramos e insertamos.
        DB::table('clinics')->delete();

        $clinics = [
            ['name' => "Austrovet Cuenca", 'province' => "Azuay", 'canton' => "Cuenca", 'address' => "Huayna-Cápac y Av. Loja", 'phone' => "07-2246815", 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => "Instavet Guayaquil", 'province' => "Guayas", 'canton' => "Guayaquil", 'address' => "Av. Francisco de Orellana", 'phone' => "04-6002132", 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => "Happy Pet Quito", 'province' => "Pichincha", 'canton' => "Quito", 'address' => "Av. Amazonas", 'phone' => "02-1234567", 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => "AvicMartin Guayaquil", 'province' => "Guayas", 'canton' => "Guayaquil", 'address' => "Km 13 vía Daule", 'phone' => "04-1234567", 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => "Veterinaria Norte Quito", 'province' => "Pichincha", 'canton' => "Quito", 'address' => "Carapungo", 'phone' => "02-9876543", 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => "D’Can Vet Manta", 'province' => "Manabí", 'canton' => "Manta", 'address' => "Av. Malecón", 'phone' => "05-1234567", 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => "Rintintin Machala", 'province' => "El Oro", 'canton' => "Machala", 'address' => "Centro", 'phone' => "07-9876543", 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => "Veterinaria Azogues", 'province' => "Cañar", 'canton' => "Azogues", 'address' => "Av. 24 de Mayo", 'phone' => "07-2246815", 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => "Clínica Loja", 'province' => "Loja", 'canton' => "Loja", 'address' => "Centro histórico", 'phone' => "07-5678901", 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => "My Pet Quito", 'province' => "Pichincha", 'canton' => "Quito", 'address' => "Valle de los Chillos", 'phone' => "02-3456789", 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('clinics')->insert($clinics);
    }
}