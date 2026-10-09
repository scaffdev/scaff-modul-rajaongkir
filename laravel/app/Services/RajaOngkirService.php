<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

/**
 * Service RajaOngkir V2 (Komerce) — disuntik Scaffdev Builder ke template Laravel.
 *
 * NOTED:
 * - File ini 100% milik modul "rajaongkir" (lihat scaff.integration.json).
 * - Key dikirim via HEADER `key:` (bukan query) agar tidak nyangkut di log.
 * - Hasil pencarian destinasi boleh di-cache (docs), cost JANGAN.
 *   Ref: https://rajaongkir.com/docs
 */
class RajaOngkirService
{
    protected string $base = 'https://rajaongkir.komerce.id/api/v1';

    /** Kurir domestik yang didukung V2 (lihat docs 3PL Availability). */
    public const SUPPORTED_COURIERS = [
        'jne', 'sicepat', 'ide', 'sap', 'ninja', 'jnt', 'tiki',
        'wahana', 'pos', 'sentral', 'lion', 'rex', 'spx',
    ];

    protected function client(): \Illuminate\Http\Client\PendingRequest
    {
        $key = config('services.rajaongkir.key');
        abort_if(empty($key), 500, 'Isi RAJAONGKIR_API_KEY');

        return Http::withHeaders(['key' => $key])->acceptJson();
    }

    /** Ambil data + pastikan meta code = 200. */
    protected function data(array $json): array
    {
        $code = $json['meta']['code'] ?? 0;
        abort_if($code !== 200, 502, 'RajaOngkir: ' . ($json['meta']['message'] ?? 'unknown error'));

        return $json['data'] ?? [];
    }

    /**
     * Cari destinasi domestik (kota, kecamatan, kelurahan, kodepos).
     * Return: [{id, label, province_name, city_name, district_name, subdistrict_name, zip_code}].
     */
    public function search(string $keyword, int $limit = 10, int $offset = 0): array
    {
        abort_if(trim($keyword) === '', 422, 'keyword pencarian wajib diisi');
        abort_if($limit < 1 || $limit > 100, 422, 'limit wajib 1-100');

        $json = $this->client()->get("{$this->base}/destination/domestic-destination", [
            'search' => trim($keyword),
            'limit' => $limit,
            'offset' => $offset,
        ])->throw()->json();

        return array_map(function (array $d) {
            $d['id'] = (int) ($d['id'] ?? 0);
            return $d;
        }, $this->data($json));
    }

    /**
     * Hitung ongkir, return list rata [{courier, service, description, value, etd}].
     * $courier: satu kode atau gabungan ":" (mis. "jne:sicepat:pos").
     */
    public function cost(int $origin, int $destination, int $weight, string $courier, ?string $price = null): array
    {
        abort_if($origin <= 0 || $destination <= 0, 422, 'origin & destination wajib ID destinasi');
        abort_if($weight <= 0, 422, 'weight wajib gram > 0');

        $codes = array_values(array_filter(array_map(
            fn (string $c) => strtolower(trim($c)),
            explode(':', $courier)
        )));
        abort_if(count($codes) === 0, 422, 'courier wajib diisi');
        foreach ($codes as $c) {
            abort_if(! in_array($c, self::SUPPORTED_COURIERS, true), 422, "courier tidak didukung: \"{$c}\"");
        }
        abort_if($price !== null && ! in_array($price, ['lowest', 'highest'], true), 422, 'price hanya "lowest" | "highest"');

        // NOTED: endpoint cost memakai POST form (asForm), bukan JSON.
        $payload = array_filter([
            'origin' => $origin,
            'destination' => $destination,
            'weight' => $weight,
            'courier' => implode(':', $codes),
            'price' => $price,
        ]);

        $json = $this->client()->asForm()->post("{$this->base}/calculate/domestic-cost", $payload)->throw()->json();

        $options = [];
        foreach ($this->data($json) as $r) {
            $options[] = [
                'courier' => $r['code'] ?? null,
                'service' => $r['service'] ?? null,
                'description' => $r['description'] ?? null,
                'value' => (int) ($r['cost'] ?? 0),
                'etd' => $r['etd'] ?? null,
            ];
        }

        return $options;
    }
}
