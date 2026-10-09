<?php

namespace App\Http\Controllers;

use App\Services\RajaOngkirService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller RajaOngkir V2 — disuntik Scaffdev Builder ke template Laravel.
 *
 * NOTED — daftarkan route manual (mis. di routes/api.php):
 *   Route::get('/api/shipping/destinations', [RajaOngkirController::class, 'destinations']);
 *   Route::post('/api/shipping/cost', [RajaOngkirController::class, 'cost']);
 */
class RajaOngkirController extends Controller
{
    public function __construct(protected RajaOngkirService $ongkir) {}

    /** GET /api/shipping/destinations?search=<keyword>&limit=<n> */
    public function destinations(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => 'required|string|max:100',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        return response()->json([
            'destinations' => $this->ongkir->search($data['search'], $data['limit'] ?? 10),
        ]);
    }

    /** POST /api/shipping/cost */
    public function cost(Request $request): JsonResponse
    {
        $data = $request->validate([
            'origin' => 'required|integer|min:1',
            'destination' => 'required|integer|min:1',
            'weight' => 'required|integer|min:1',
            'courier' => 'required|string|max:255',
            'price' => 'nullable|in:lowest,highest',
        ]);

        return response()->json([
            'options' => $this->ongkir->cost(
                $data['origin'],
                $data['destination'],
                $data['weight'],
                $data['courier'],
                $data['price'] ?? null
            ),
        ]);
    }
}
