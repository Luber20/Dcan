<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class VeterinarianController extends Controller
{
    public function getProfile(Request $request)
    {
        // Devolvemos el usuario autenticado con sus nuevos campos
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // 1. Validar los datos
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'specialty' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:1000',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Actualizar campos de texto
        $user->name = $request->name;
        $user->specialty = $request->specialty;
        $user->phone = $request->phone;
        $user->bio = $request->bio;

        // 3. Manejo de la Imagen
        if ($request->hasFile('photo')) {
            // Eliminar la foto vieja si existe
            if ($user->photo_path) {
                // Extraemos el nombre del archivo de la URL guardada
                $oldPath = str_replace(asset('storage/'), '', $user->photo_path);
                Storage::disk('public')->delete($oldPath);
            }

            // Guardar la nueva foto en storage/app/public/profiles
            $path = $request->file('photo')->store('profiles', 'public');
            
            // Guardamos la URL completa para que React Native la lea directo
            $user->photo_path = asset('storage/' . $path);
        }

        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => $user
        ]);
    }
}