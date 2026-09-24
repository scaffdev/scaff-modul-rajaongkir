# scaff-modul-rajaongkir

Modul **RajaOngkir Starter** (cek ongkir JNE, POS, TIKI) untuk
[Scaffdev](https://scaffdev.vercel.app) Builder.
Disuntik via `scaff ... --with=rajaongkir` (CLI 0.2.0+).

| Framework | Status | Isi |
|---|---|---|
| Next.js | ✅ v1.0.0 | Client Starter API + route kota + route hitung ongkir |
| Laravel | 🟡 STAGED (v1.1.0) | Service + Controller sudah ditulis, belum disuntik CLI |

## Struktur

```
scaff-modul-rajaongkir/
├── scaff.integration.json   ← manifest (satu-satunya yang dibaca CLI)
├── SETUP-FRAGMENT.md        ← digabung ke SETUP.md hasil racikan
├── REMOVE.md                ← panduan copot (skenario double shipping)
├── nextjs/
│   ├── lib/shipping/rajaongkir.ts
│   └── app/api/shipping/{cities/route.ts,cost/route.ts}
└── laravel/                 ← STAGED untuk v1.1.0
    ├── app/Services/RajaOngkirService.php
    └── app/Http/Controllers/RajaOngkirController.php
```

## Env (sudah ada di seed Scaffdev → tabel `integrasi`)

| Key | Keterangan |
|---|---|
| `RAJAONGKIR_API_KEY` | API Key Starter (server saja) |

## Validasi lokal (sebelum push)

```bash
scaffdev validate-module .
```

## Docs resmi yang dirujuk kode

- Daftar docs: https://rajaongkir.id/dokumentasi
- Starter API: https://api.rajaongkir.com/dokumentasi/starter
