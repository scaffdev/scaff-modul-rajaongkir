/**
 * Client RajaOngkir V2 (Komerce) — disuntik Scaffdev Builder ke template Next.js.
 *
 * NOTED:
 * - File ini 100% milik modul "rajaongkir". Jangan import dari kode inti template.
 * - API Key HANYA di server (route API di bawah), JANGAN dipanggil dari browser.
 * - Alur V2: cari destinasi (keyword) → dapat `id` → hitung cost dengan `id`.
 *   Tidak ada lagi konsep province/city terpisah — satu pencarian mencakup
 *   provinsi, kota, kecamatan, kelurahan, dan kodepos.
 *
 * Referensi resmi:
 * - Docs V2   : https://rajaongkir.com/docs
 * - Endpoint  : https://rajaongkir.com/docs/shipping-cost/getting_started/endpoint
 * - API Key   : dashboard https://collaborator.komerce.id (Developer → Settings → Api Key)
 */
const BASE = "https://rajaongkir.komerce.id/api/v1";

function apiKey(): string {
  const key = process.env.RAJAONGKIR_API_KEY;
  if (!key) throw new Error("MISSING_ENV: isi RAJAONGKIR_API_KEY di .env.local");
  return key;
}

interface V2Envelope<T> {
  meta?: { message?: string; code?: number; status?: string };
  data?: T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    // NOTED: key dikirim via HEADER (bukan query/body) agar tidak nyangkut
    // di log URL. Format header resmi V2: `key: <API_KEY>`.
    headers: { key: apiKey(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`RajaOngkir error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as V2Envelope<T>;
  // NOTED: HTTP 200 belum tentu sukses — V2 menaruh status sendiri di meta
  // (mis. key salah / kuota habis). Cek SELALU.
  if (data.meta && typeof data.meta.code === "number" && data.meta.code !== 200) {
    throw new Error(`RajaOngkir: ${data.meta.message ?? "unknown error"}`);
  }
  if (data.data === undefined) throw new Error("RajaOngkir: respons tanpa data");
  return data.data;
}

export interface Destination {
  /** ID destinasi — dipakai sebagai origin/destination di calculateCost. */
  id: number;
  /** Format alamat lengkap, siap tampil di dropdown. */
  label: string;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  zip_code: string;
}

/**
 * Cari destinasi domestik (kota, kecamatan, kelurahan, atau kodepos).
 * NOTED: hasil pencarian BOLEH di-cache (data wilayah jarang berubah).
 */
export async function searchDestinations(
  keyword: string,
  opts?: { limit?: number; offset?: number }
): Promise<Destination[]> {
  const q = keyword?.trim();
  if (!q) throw new Error("keyword pencarian wajib diisi");
  const limit = opts?.limit ?? 10;
  const offset = opts?.offset ?? 0;
  const params = new URLSearchParams({ search: q, limit: String(limit), offset: String(offset) });
  const list = await request<Destination[]>(`/destination/domestic-destination?${params}`);
  return list.map((d) => ({ ...d, id: Number(d.id) }));
}

/** Kurir domestik yang didukung V2 (lihat docs 3PL Availability). */
export const SUPPORTED_COURIERS = [
  "jne",
  "sicepat",
  "ide",
  "sap",
  "ninja",
  "jnt",
  "tiki",
  "wahana",
  "pos",
  "sentral",
  "lion",
  "rex",
  "spx",
] as const;
export type SupportedCourier = (typeof SUPPORTED_COURIERS)[number];

export interface CostOption {
  /** Kode kurir, mis. "jne". */
  courier: string;
  /** Nama layanan, mis. "REG". */
  service: string;
  description: string;
  /** Tarif Rupiah. */
  value: number;
  /** Estimasi waktu, mis. "2-3". */
  etd: string;
}

interface CostApiItem {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

/**
 * Hitung ongkir. NOTED: hasil cost DILARANG di-cache (docs) — selalu
 * request langsung agar tarif akurat.
 */
export async function calculateCost(params: {
  /** ID destinasi asal (dari searchDestinations). */
  origin: number;
  /** ID destinasi tujuan (dari searchDestinations). */
  destination: number;
  /** Berat gram, integer. */
  weight: number;
  /** Satu kode kurir atau gabungan ":" (mis. "jne:sicepat:pos"). */
  courier: string;
  /** Urutan hasil: termurah / termahal dulu. */
  price?: "lowest" | "highest";
}): Promise<CostOption[]> {
  if (!Number.isInteger(params.origin) || !Number.isInteger(params.destination)) {
    throw new Error("origin & destination wajib ID destinasi (lihat /api/shipping/destinations)");
  }
  if (!Number.isInteger(params.weight) || params.weight <= 0) {
    throw new Error("weight wajib gram bilangan bulat > 0");
  }
  const codes = params.courier.split(":").map((c) => c.trim().toLowerCase()).filter(Boolean);
  if (codes.length === 0) throw new Error("courier wajib diisi");
  for (const c of codes) {
    if (!SUPPORTED_COURIERS.includes(c as SupportedCourier)) {
      throw new Error(`courier tidak didukung: "${c}" (didukung: ${SUPPORTED_COURIERS.join(", ")})`);
    }
  }
  if (params.price !== undefined && params.price !== "lowest" && params.price !== "highest") {
    throw new Error('price hanya "lowest" | "highest"');
  }

  // NOTED: endpoint cost memakai POST form-urlencoded (bukan JSON).
  const body = new URLSearchParams({
    origin: String(params.origin),
    destination: String(params.destination),
    weight: String(params.weight),
    courier: codes.join(":"),
    ...(params.price ? { price: params.price } : {}),
  });
  const items = await request<CostApiItem[]>("/calculate/domestic-cost", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  // NOTED: V2 mengembalikan list rata per kurir-layanan — teruskan apa adanya.
  return items.map((r) => ({
    courier: r.code,
    service: r.service,
    description: r.description,
    value: Number(r.cost),
    etd: r.etd,
  }));
}
