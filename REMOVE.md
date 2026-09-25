# Cara mencopot RajaOngkir

> Dibutuhkan bila kamu ganti ke shipping lain (mis. via Scaffdev Builder).
> Estimasi: ±10 menit. Ikuti berurutan — jangan loncat.

## 0. Aturan emas (baca dulu!)

- Hapus **HANYA** file di bagian 1. File lain **JANGAN PERNAH** dihapus.
- Kalau ragu satu file, BERHENTI dan tanya pembuat template.

---

## A. Template Next.js

### A.1. Hapus file (aman — tidak dipakai kode lain)

- `lib/shipping/rajaongkir.ts` — client Starter API.
- `app/api/shipping/cities/route.ts` — daftar kota.
- `app/api/shipping/cost/route.ts` — hitung ongkir.

```bash
rm lib/shipping/rajaongkir.ts "app/api/shipping/cities/route.ts" "app/api/shipping/cost/route.ts"
```

### A.2. Hapus env (dari `.env.local`)

- `RAJAONGKIR_API_KEY`

Hapus barisnya, jangan dikosongkan saja.

### A.3. Bersihkan dependency

Tidak ada dependency tambahan (modul ini memakai `fetch` bawaan Node).

### A.4. Verifikasi (wajib lolos semua)

```bash
npm run build
```

```bash
grep -ri "rajaongkir\|ongkir" app lib components
```

- Build harus sukses.
- Grep harus menghasilkan **0 baris**. Bila masih ada sisa (mis. dropdown
  kota di checkout), ganti dulu sumber datanya, lalu build ulang.

### A.5. Yang JANGAN dihapus

- Halaman checkout umum (ganti sumber ongkirnya dulu).
- `package.json`, `.env.local` (cukup hapus baris env-nya), layout, config.

---

## B. Template Laravel

### B.1. Hapus file (aman — tidak dipakai kode lain)

- `app/Services/RajaOngkirService.php` — client Starter API.
- `app/Http/Controllers/RajaOngkirController.php` — kota + hitung ongkir.

```bash
rm "app/Services/RajaOngkirService.php" "app/Http/Controllers/RajaOngkirController.php"
```

### B.2. Hapus env (dari `.env`)

- `RAJAONGKIR_API_KEY`

Hapus barisnya, jangan dikosongkan saja.

### B.3. Bersihkan dependency

Tidak ada dependency tambahan (modul ini memakai HTTP client Laravel).

### B.4. Verifikasi (wajib lolos semua)

```bash
composer install --no-dev
php artisan config:clear
```

```bash
grep -ri "rajaongkir\|ongkir" app routes resources config
```

- Install harus sukses tanpa error.
- Grep harus menghasilkan **0 baris**. Bila masih ada sisa (mis. dropdown
  kota di checkout), ganti dulu sumber datanya, lalu verifikasi ulang.
- Hapus juga blok `rajaongkir` di `config/services.php` bila kamu menambahkannya.

### B.5. Yang JANGAN dihapus (Laravel)

- Halaman checkout umum (ganti sumber ongkirnya dulu).
- `config/services.php` itu sendiri (cukup hapus blok `rajaongkir`-nya),
  `composer.json`, `.env` (cukup hapus baris env-nya).
