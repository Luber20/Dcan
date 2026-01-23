<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Species;
use App\Models\Breed;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    // Obtener todo el catálogo (Para la App del Cliente/Vet)
    public function index()
    {
        // Devuelve Especies con sus Razas: [{id:1, name:'Perro', breeds:[...]}]
        return Species::with('breeds')->get();
    }

    // --- MÉTODOS SOLO PARA SUPERADMIN ---

    // Crear Especie (Ej: Perro)
    public function storeSpecies(Request $request)
    {
        $request->validate(['name' => 'required|unique:species,name']);
        $species = Species::create(['name' => $request->name]);
        return response()->json($species);
    }

    // Borrar Especie
    public function deleteSpecies($id)
    {
        Species::destroy($id);
        return response()->json(['message' => 'Especie eliminada']);
    }

    // Crear Raza (Ej: Bulldog, ligado a Perro)
    public function storeBreed(Request $request)
    {
        $request->validate([
            'species_id' => 'required|exists:species,id',
            'name' => 'required'
        ]);
        
        $breed = Breed::create([
            'species_id' => $request->species_id,
            'name' => $request->name
        ]);
        
        return response()->json($breed);
    }

    // Borrar Raza
    public function deleteBreed($id)
    {
        Breed::destroy($id);
        return response()->json(['message' => 'Raza eliminada']);
    }
}