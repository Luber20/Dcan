<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pet;

class PetController extends Controller
{
    // 1. LISTAR (Solo mascotas del usuario autenticado)
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
            'photo' => 'nullable|file',
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

    // 3. ACTUALIZAR
    public function update(Request $request, $id)
    {
        $pet = $request->user()->pets()->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:50',
            'species' => 'required|string',
            'gender' => 'required|string',
            'photo' => 'nullable|file',
        ]);

        $data = $request->except(['_method', 'photo']);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pets', 'public');
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

    // ✅ 5. MOSTRAR PARA VETERINARIO (NUEVO)
    // Este método busca la mascota por ID sin restringir que sea del usuario actual.
    public function showForVet($id)
    {
        // Traemos también los datos del dueño ('user')
        $pet = Pet::with('user')->find($id);

        if (!$pet) {
            return response()->json(['message' => 'Mascota no encontrada'], 404);
        }

        return response()->json($pet);
    }
}