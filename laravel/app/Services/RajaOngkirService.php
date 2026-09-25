<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

/**
 * Service RajaOngkir Starter — disuntik Scaffdev Builder ke template Laravel.
 *
 * NOTED:
 * - File ini 100% milik modul "rajaongkir" (lihat scaff.integration.json).
 * - Key dikirim via HEADER `key:` (bukan query) agar tidak nyangkut di log.
 * - Province/city boleh di-cache (docs), cost JANGAN.
 *   Ref: https://rajaongkir.id/dokumentasi
 */
class RajaOngkirService
{
    protected string $base = 'https://api.rajaongkir.com/starter';

    protected function client(): \Illuminate\Http\Client\PendingRequest
    {
        $key = config('services.rajaongkir.key');
        abort_if(empty($key), 500, 'Isi RAJAONGKIR_API_KEY');

        return Http::withHeaders(['key' => $key])->acceptJson();
    }

    /** Ambil results + pastikan status code body = 200. */
    protected function results(array $json): array
    {
        $code = $json['rajaongkir']['status']['code'] ?? 0;
        abort_if($code !== 200, 502, 'RajaOngkir: ' . ($json['rajaongkir']['status']['description'] ?? 'unknown error'));

        return $json['rajaongkir']['results'] ?? [];
    }

    public function provinces(): array
    {
        return $this->results($this->client()->get("{$this->base}/province")->throw()->json());
    }

    public function cities(?string $provinceId = null): array
    {
        return $this->results(
            $this->client()->get("{$this->base}/city", array_filter(['province' => $provinceId]))->throw()->json()
        );
    }

    /**
     * Hitung ongkir, return list rata [{courier, service, description, value, etd}].
     * $courier: jne | pos | tiki (akun Starter).
     */
    public function cost(string $origin, string $destination, int $weight, string $courier): array
    {
        abort_if(trim($origin) === '' || trim($destination) === '', 422, 'origin & destination wajib ID kota');
        abort_if($weight <= 0, 422, 'weight wajib gram > 0');
        abort_if(! in_array($courier, ['jne', 'pos', 'tiki'], true), 422, 'courier Starter: jne, pos, tiki');

        // NOTED: endpoint cost memakai POST form (asForm), bukan JSON.
        $json = $this->client()->asForm()->post("{$this->base}/cost", [
            'origin' => $origin,
            'destination' => $destination,
            'weight' => $weight,
            'courier' => $courier,
        ])->throw()->json();

        $options = [];
        foreach ($this->results($json) as $r) {
            foreach ($r['costs'] ?? [] as $s) {
                foreach ($s['cost'] ?? [] as $c) {
                    $options[] = [
                        'courier' => $r['code'],
                        'service' => $s['service'],
                        'description' => $s['description'],
                        'value' => $c['value'],
                        'etd' => $c['etd'],
                    ];
                }
            }
        }

        return $options;
    }
}
