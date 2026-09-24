<?php

namespace App\Http\Controllers;

use App\Services\RajaOngkirService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller RajaOngkir — STAGED untuk dukungan Laravel (aktif di v1.1.0).
 *
 * NOTED — daftarkan route manual saat v1.1.0 rilis:
 *   Route::get('/api/shipping/cities', [RajaOngkirController::class, 'cities']);
 *   Route::post('/api/shipping/cost', [RajaOngkirController::class, 'cost']);
 */
class RajaOngkirController extends Controller
{
    public function __construct(protected RajaOngkirService $ongkir) {}

    /** GET /api/shipping/cities?province=<id> */
    public function cities(Request $request): JsonResponse
    {
        $data = $request->validate(['province' => 'nullable|string|max:10']);

        return response()->json(['cities' => $this->ongkir->cities($data['province'] ?? null)]);
    }

    /** POST /api/shipping/cost */
    public function cost(Request $request): JsonResponse
    {
        $data = $request->validate([
            'origin' => 'required|string|max:10',
            'destination' => 'required|string|max:10',
            'weight' => 'required|integer|min:1',
            'courier' => 'required|in:jne,pos,tiki',
        ]);

        return response()->json([
            'options' => $this->ongkir->cost($data['origin'], $data['destination'], $data['weight'], $data['courier']),
        ]);
    }
}
