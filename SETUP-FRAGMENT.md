## Setup RajaOngkir (digabung otomatis ke SETUP.md)

> 3 langkah, ±5 menit. Akun Starter GRATIS (JNE, POS, TIKI).
> Docs resmi: https://rajaongkir.id/dokumentasi

### 1. Ambil API Key

1. Daftar di https://rajaongkir.com → otomatis dapat akun **Starter**.
2. Buka dashboard → salin **API Key**.

### 2. Isi env

```bash
RAJAONGKIR_API_KEY=xxxx   # server saja, tanpa NEXT_PUBLIC_
```

### 3. Coba hitung ongkir

1. Ambil ID kota: `GET /api/shipping/cities?province=5` (5 = Jawa Tengah).
   Catat `city_id` asal & tujuan.
2. Hitung: `POST /api/shipping/cost` dengan body:
   ```json
   { "origin": "501", "destination": "114", "weight": 1000, "courier": "jne" }
   ```
   NOTED: `weight` dalam **gram**. Kode kurir Starter hanya `jne`, `pos`, `tiki`.

### Catatan performa (dari docs)

- `province`/`cities` **boleh di-cache** (data jarang berubah) — bagus untuk
  dropdown autocomplete kota.
- `cost` **jangan di-cache** — request langsung tiap checkout agar akurat.
