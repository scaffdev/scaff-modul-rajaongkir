## Setup RajaOngkir V2 (digabung otomatis ke SETUP.md)

> 3 langkah, ±5 menit. Akun Starter GRATIS, kurir domestik didukung V2.
> Docs resmi: https://rajaongkir.com/docs

### 1. Ambil API Key

1. Daftar/login di https://collaborator.komerce.id → otomatis dapat akun **Starter**.
2. Buka **Developer → Settings → Api Key**, salin APIKEY **Shipping Cost**.
   (Jangan pakai key layanan lain, mis. Shipping Delivery.)

### 2. Isi env

```bash
RAJAONGKIR_API_KEY=xxxx   # server saja, tanpa NEXT_PUBLIC_
```

### 3. Coba hitung ongkir

1. Cari ID destinasi: `GET /api/shipping/destinations?search=bandung&limit=5`.
   Catat `id` asal & tujuan dari hasil.
2. Hitung: `POST /api/shipping/cost` dengan body:
   ```json
   { "origin": 1234, "destination": 5678, "weight": 1000, "courier": "jne" }
   ```
   NOTED: `origin`/`destination` = **ID angka** (bukan nama kota).
   `weight` dalam **gram**. `courier` boleh gabungan `":"`
   (mis. `"jne:sicepat:pos"`); daftar kode: `jne, sicepat, ide, sap, ninja,
   jnt, tiki, wahana, pos, sentral, lion, rex, spx`.

### Catatan performa (dari docs)

- `destinations` **boleh di-cache** (data wilayah jarang berubah) — bagus untuk
  dropdown autocomplete (tambah debounce agar tidak membanjiri API).
- `cost` **jangan di-cache** — request langsung tiap checkout agar akurat.

---

## Setup Laravel (base Laravel)

> CLI menyuntik Service + Controller; 3 langkah manual di bawah wajib
> karena tidak bisa di-generate otomatis. Tanpa SDK tambahan.

### L1. Isi `.env`

```bash
RAJAONGKIR_API_KEY=xxxx   # server saja
```

### L2. Tambah ke `config/services.php`

```php
'rajaongkir' => [
    'key' => env('RAJAONGKIR_API_KEY'),
],
```

### L3. Daftarkan route (mis. di `routes/api.php`)

```php
use App\Http\Controllers\RajaOngkirController;

Route::get('/api/shipping/destinations', [RajaOngkirController::class, 'destinations']);
Route::post('/api/shipping/cost', [RajaOngkirController::class, 'cost']);
```

Lalu `php artisan config:clear`. Berat dalam gram; daftar kurir V2:
`jne, sicepat, ide, sap, ninja, jnt, tiki, wahana, pos, sentral, lion, rex, spx`.
