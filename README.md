# scaff-modul-rajaongkir

Modul **RajaOngkir V2 (Komerce)** (cek ongkir domestik multi-kurir) untuk
[Scaffdev](https://scaffdev.vercel.app) Builder.
Disuntik via `scaff ... --with=rajaongkir` (CLI 0.2.0+).

| Framework | Status | Isi |
|---|---|---|
| Next.js | ✅ v1.1.0 | Client V2 API + route destinasi + route hitung ongkir |
| Laravel | ✅ v1.1.0 | Service + Controller (HTTP client) |

## Struktur

```
scaff-modul-rajaongkir/
├── scaff.integration.json   ← manifest (satu-satunya yang dibaca CLI)
├── SETUP-FRAGMENT.md        ← digabung ke SETUP.md hasil racikan
├── REMOVE.md                ← panduan copot (skenario double shipping)
├── nextjs/
│   ├── lib/shipping/rajaongkir.ts
│   └── app/api/shipping/{destinations/route.ts,cost/route.ts}
└── laravel/                 ← sumber untuk base Laravel
    ├── app/Services/RajaOngkirService.php
    └── app/Http/Controllers/RajaOngkirController.php
```

## Env (sudah ada di seed Scaffdev → tabel `integrasi`)

| Key | Keterangan |
|---|---|
| `RAJAONGKIR_API_KEY` | API Key Shipping Cost (server saja) |

## Validasi lokal (sebelum push)

```bash
scaffdev validate-module .
```

## Docs resmi yang dirujuk kode

- Docs V2: https://rajaongkir.com/docs
- Endpoint: https://rajaongkir.com/docs/shipping-cost/getting_started/endpoint
- API Key: https://rajaongkir.com/docs/shipping-cost/getting_started/apikey
