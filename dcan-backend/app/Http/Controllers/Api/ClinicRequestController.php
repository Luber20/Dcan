<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClinicRequest;
use App\Models\Clinic;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ClinicRequestController extends Controller
{
    // ✅ Público: crear solicitud con comprobante
    public function store(Request $request)
    {
        $data = $request->validate([
            'clinic_name' => 'required|string|max:255',
            'province' => 'nullable|string|max:255',
            'canton' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'owner_name' => 'nullable|string|max:255',
            'ruc' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'payment_proof' => 'nullable|image|max:10240', // Max 10MB
        ]);

        // Guardar imagen si existe
        $proofPath = null;
        if ($request->hasFile('payment_proof')) {
            $proofPath = $request->file('payment_proof')->store('payments', 'public');
        }

        $amount = 5.00;

        $req = ClinicRequest::create([
            ...collect($data)->except(['payment_proof'])->toArray(),
            
            'payment_proof_path' => $proofPath, 

            'status' => 'pending_payment',
            'public_token' => (string) Str::uuid(),

            'payment_provider' => 'manual',
            'payment_status' => 'unpaid',
            'amount' => $amount,
            'currency' => 'USD',
            'payment_reference' => null,
            'paid_at' => null,
        ]);

        return response()->json([
            'message' => 'Solicitud enviada con comprobante.',
            'data' => $req
        ], 201);
    }

    // ✅ SUPERADMIN: Listar con URL de la foto
    public function index(Request $request)
    {
        $status = $request->query('status');
        $q = ClinicRequest::query()->orderByDesc('id');

        if ($status) {
            $q->where('status', $status);
        }

        $requests = $q->get();

        // Agregamos la URL pública
        foreach ($requests as $r) {
            if ($r->payment_proof_path) {
                $r->payment_proof_url = asset('storage/' . $r->payment_proof_path);
            } else {
                $r->payment_proof_url = null;
            }
        }

        return response()->json($requests);
    }

    // ✅ Marcar Pagado
    public function markPaid(Request $request, $id)
    {
        $req = ClinicRequest::findOrFail($id);
        if ($req->payment_status === 'paid') return response()->json(['message' => 'Ya pagada.'], 200);
        
        $req->payment_status = 'paid';
        $req->paid_at = now();
        $req->status = 'pending_review'; 
        $req->reviewed_by = $request->user()->id;
        $req->reviewed_at = now();
        $req->save();

        return response()->json(['message' => 'Pago confirmado.', 'request' => $req]);
    }

    // ✅ Aprobar
    public function approve(Request $request, $id)
    {
        $req = ClinicRequest::findOrFail($id);
        if ($req->status === 'approved') return response()->json(['message' => 'Ya aprobada.'], 200);
        if ($req->payment_status !== 'paid') return response()->json(['message' => 'Falta pago.'], 422);

        $clinic = Clinic::create([
            'name' => $req->clinic_name,
            'province' => $req->province,
            'canton' => $req->canton,
            'address' => $req->address,
            'phone' => $req->phone,
            'email' => $req->email,
            'is_active' => true,
        ]);

        $req->status = 'approved';
        $req->reviewed_by = $request->user()->id;
        $req->reviewed_at = now();
        $req->save();

        return response()->json(['message' => 'Aprobada.', 'clinic' => $clinic]);
    }

    // ✅ Rechazar
    public function reject(Request $request, $id)
    {
        $req = ClinicRequest::findOrFail($id);
        if ($req->status === 'rejected') return response()->json(['message' => 'Ya rechazada.'], 200);
        $req->status = 'rejected';
        $req->reviewed_by = $request->user()->id;
        $req->reviewed_at = now();
        $req->save();
        return response()->json(['message' => 'Rechazada.', 'request' => $req]);
    }
}