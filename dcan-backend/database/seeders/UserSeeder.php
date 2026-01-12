<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Clinic;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener la primera clínica
        $clinic = Clinic::first();

        if ($clinic) {
            $user = User::firstOrCreate(
                ['email' => 'admin@clinic.com'],
                [
                    'name' => 'Admin Clinica',
                    'password' => Hash::make('Password123!'),
                    'clinic_id' => $clinic->id,
                ]
            );

            $user->assignRole('clinic_admin');
        }
    }
}