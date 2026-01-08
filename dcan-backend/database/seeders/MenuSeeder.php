<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Limpiamos tablas previas
        DB::table('menu_role')->delete();
        DB::table('menus')->delete();

        // 2. Crear los Menús
        
        $mInicio = Menu::create([
            'name' => 'Inicio',    
            'icon' => 'home',     
            'screen_name' => 'HomeScreen', 
            'order' => 1
        ]);

        $mMascotas = Menu::create([
            'name' => 'Mascotas',  
            'icon' => 'paw',      
            'screen_name' => 'PetsStack', 
            'order' => 2
        ]); 

        $mAgendar = Menu::create([
            'name' => 'Agendar',   
            'icon' => 'calendar', 
            'screen_name' => 'ScheduleScreen', 
            'order' => 3
        ]);

        $mCitas = Menu::create([
            'name' => 'Mis Citas', 
            'icon' => 'time',     
            'screen_name' => 'AppointmentsScreen', 
            'order' => 4
        ]);

        $mPerfil = Menu::create([
            'name' => 'Perfil',    
            'icon' => 'person',   
            'screen_name' => 'ProfileScreen', 
            'order' => 5
        ]);

        // 3. Asignar estos menús al Rol "client"
        // CORRECCIÓN: Usamos la relación desde el Menú hacia el Rol
        $roleClient = Role::where('name', 'client')->first();
        
        if ($roleClient) {
            // Recorremos los menús creados y les adjuntamos el rol
            $menusParaCliente = [$mInicio, $mMascotas, $mAgendar, $mCitas, $mPerfil];
            
            foreach ($menusParaCliente as $menu) {
                // "A este menú, agrégale este rol"
                $menu->roles()->attach($roleClient->id);
            }
        }
    }
}