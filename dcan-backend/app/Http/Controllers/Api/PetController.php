<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pet;

class PetController extends Controller
{
    // 1. LISTAR
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->pets()->orderBy('created_at', 'desc')->get()
        );
    }

    // 2. CREAR
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'species' => 'required|string',
            'gender' => 'required|string',
            'photo' => 'nullable|file', // Validamos como archivo genérico
        ]);

        $photoUrl = null;

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pets', 'public');
            $photoUrl = asset('storage/' . $path);
        }

        $pet = Pet::create([
            'name' => $request->name,
            'species' => $request->species,
            'breed' => $request->breed,
            'gender' => $request->gender,
            'age' => $request->age,
            'weight' => $request->weight,
            'vaccines' => $request->vaccines,
            'photo_url' => $photoUrl, 
            'user_id' => $request->user()->id,
            'clinic_id' => $request->user()->clinic_id,
        ]);

        return response()->json($pet, 201);
    }

    // 3. ACTUALIZAR (Editar)
    public function update(Request $request, $id)
    {
        $pet = $request->user()->pets()->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:50',
            'species' => 'required|string',
            'gender' => 'required|string',
            'photo' => 'nullable|file', // Permitir archivo
        ]);

        // Obtenemos todos los datos MENOS _method y photo
        $data = $request->except(['_method', 'photo']);

        // 📸 Lógica de Imagen para Update
        if ($request->hasFile('photo')) {
            // Guardamos la nueva
            $path = $request->file('photo')->store('pets', 'public');
            // Actualizamos la URL en el array de datos
            $data['photo_url'] = asset('storage/' . $path);
        }

        $pet->update($data);

        return response()->json(['message' => 'Mascota actualizada', 'pet' => $pet]);
    }

    // 4. ELIMINAR
    public function destroy(Request $request, $id)
    {
        $pet = $request->user()->pets()->findOrFail($id);
        $pet->delete();
        return response()->json(['message' => 'Mascota eliminada']);
    }
}