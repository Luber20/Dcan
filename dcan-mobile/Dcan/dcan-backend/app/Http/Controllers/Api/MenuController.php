<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Menu;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // 1. Verificar si el usuario existe
            if (!$user) {
                return response()->json(['message' => 'Usuario no autenticado'], 401);
            }

            // 2. Cargar relación de roles si no está cargada
            if (!$user->relationLoaded('roles')) {
                $user->load('roles');
            }

            // Obtenemos los IDs de los roles
            $roleIds = $user->roles->pluck('id');

            if ($roleIds->isEmpty()) {
                return response()->json([]);
            }

            // 3. CONSULTA CORREGIDA (SOLUCIÓN FINAL)
            // Usamos 'roles.id' para que la base de datos sepa exactamente qué buscar
            $menus = Menu::whereHas('roles', function($q) use ($roleIds) {
                $q->whereIn('roles.id', $roleIds); // 👈 AQUÍ ESTÁ EL CAMBIO CLAVE
            })
            ->where('is_active', true)
            ->orderBy('order', 'asc')
            ->get();

            return response()->json($menus);

        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}