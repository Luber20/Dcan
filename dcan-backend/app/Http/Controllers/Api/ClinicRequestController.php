<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClinicRequest;
use App\Models\Clinic;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ClinicRequestController extends Controller
{
    // ✅ Público: crear solicitud (pago manual primero)
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
        ]);

        // ✅ Define aquí la tasa anti-spam (manual)
        $amount = 5.00;

        $req = ClinicRequest::create([
            ...$data,

            // Estados de pago primero
            'status' => 'pending_payment',        // pending_payment -> pending_review -> approved/rejected
            'public_token' => (string) Str::uuid(),

            'payment_provider' => 'manual',
            'payment_status' => 'unpaid',
            'amount' => $amount,
            'currency' => 'USD',

            // Aún no hay referencia ni paid_at
            'payment_reference' => null,
            'paid_at' => null,
        ]);

        return response()->json([
            'message' => 'Solicitud creada. Pago manual requerido.',
            'data' => $req,
            'payment_instructions' => [
                'amount' => $amount,
                'currency' => 'USD',
                'reference' => $req->public_token,
                'note' => 'Incluye esta referencia en el comprobante de pago.',
            ],
        ], 201);
    }

    // ✅ SUPERADMIN: listar solicitudes (opcional filtro por status)
    public function index(Request $request)
    {
        // status: pending_payment | pending_review | approved | rejected
        $status = $request->query('status');

        $q = ClinicRequest::query()->orderByDesc('id');

        if ($status) {
            $q->where('status', $status);
        }

        return response()->json($q->get());
    }

    // ✅ SUPERADMIN: marcar pago manual como confirmado
    public function markPaid(Request $request, $id)
    {
        $req = ClinicRequest::findOrFail($id);

        // Si ya está pagada, no repetimos
        if ($req->payment_status === 'paid') {
            return response()->json(['message' => 'La solicitud ya está marcada como pagada.'], 200);
        }

        $data = $request->validate([
            'payment_reference' => 'nullable|string|max:255', // número de comprobante / referencia bancaria
        ]);

        $req->payment_status = 'paid';
        $req->paid_at = now();
        $req->payment_reference = $data['payment_reference'] ?? $req->payment_reference;

        // Cuando paga, pasa a revisión
        $req->status = 'pending_review';

        $req->reviewed_by = $request->user()->id;
        $req->reviewed_at = now();
        $req->save();

        return response()->json([
            'message' => 'Pago confirmado. Solicitud lista para revisión.',
            'request' => $req
        ]);
    }

    // ✅ SUPERADMIN: aprobar solicitud => SOLO si está pagada
    public function approve(Request $request, $id)
    {
        $req = ClinicRequest::findOrFail($id);

        if ($req->status === 'approved') {
            return response()->json(['message' => 'La solicitud ya fue aprobada.'], 200);
        }

        // ✅ Requisito de pago primero
        if ($req->payment_status !== 'paid') {
            return response()->json([
                'message' => 'No se puede aprobar: la solicitud aún no registra pago (manual).'
            ], 422);
        }

        // Crear clínica real
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

        return response()->json([
            'message' => 'Solicitud aprobada y clínica creada.',
            'clinic' => $clinic,
            'request' => $req
        ]);
    }

    // ✅ SUPERADMIN: rechazar solicitud
    public function reject(Request $request, $id)
    {
        $req = ClinicRequest::findOrFail($id);

        if ($req->status === 'rejected') {
            return response()->json(['message' => 'La solicitud ya fue rechazada.'], 200);
        }

        $req->status = 'rejected';
        $req->reviewed_by = $request->user()->id;
        $req->reviewed_at = now();
        $req->save();

        return response()->json([
            'message' => 'Solicitud rechazada.',
            'request' => $req
        ]);
    }
}
