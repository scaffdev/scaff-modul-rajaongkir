/**
 * Client RajaOngkir Starter — disuntik Scaffdev Builder ke template Next.js.
 *
 * NOTED:
 * - File ini 100% milik modul "rajaongkir". Jangan import dari kode inti template.
 * - API Key HANYA di server (route API di bawah), JANGAN dipanggil dari browser.
 * - Akun Starter = GRATIS: kurir jne/pos/tiki, kota-kabupaten (tanpa kecamatan).
 *   Butuh J&T/kecamatan/internasional → upgrade Pro (endpoint berbeda).
 *
 * Referensi resmi:
 * - Daftar docs : https://rajaongkir.id/dokumentasi
 * - Starter API : https://api.rajaongkir.com/dokumentasi/starter
 */
const BASE = "https://api.rajaongkir.com/starter";

function apiKey(): string {
  const key = process.env.RAJAONGKIR_API_KEY;
  if (!key) throw new Error("MISSING_ENV: isi RAJAONGKIR_API_KEY di .env.local");
  return key;
}

interface RajaOngkirEnvelope<T> {
  rajaongkir: { status: { code: number; description: string }; results: T };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    // NOTED: key dikirim via HEADER (bukan query/body) agar tidak nyangkut
    // di log URL. Format header resmi: `key: <API_KEY>`.
    headers: { key: apiKey(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`RajaOngkir error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as RajaOngkirEnvelope<T>;
  // NOTED: HTTP 200 belum tentu sukses — RajaOngkir menaruh status sendiri
  // di body (mis. key salah / limit habis). Cek SELALU.
  if (data.rajaongkir?.status?.code !== 200) {
    throw new Error(`RajaOngkir: ${data.rajaongkir?.status?.description ?? "unknown error"}`);
  }
  return data.rajaongkir.results;
}

export interface Province {
  province_id: string;
  province: string;
}

export interface City {
  city_id: string;
  province_id: string;
  province: string;
  type: string;
  city_name: string;
  postal_code: string;
}

/** Daftar provinsi. NOTED: docs membolehkan hasil ini di-cache (jarang berubah). */
export async function getProvinces(): Promise<Province[]> {
  return request<Province[]>("/province");
}

/** Daftar kota/kabupaten, opsional filter per provinsi. Boleh di-cache juga. */
export async function getCities(provinceId?: string): Promise<City[]> {
  const q = provinceId ? `?province=${encodeURIComponent(provinceId)}` : "";
  return request<City[]>(`/city${q}`);
}

/** Kurir yang didukung akun Starter. */
export const STARTER_COURIERS = ["jne", "pos", "tiki"] as const;
export type StarterCourier = (typeof STARTER_COURIERS)[number];

export interface CostOption {
  courier: string;
  service: string;
  description: string;
  /** Tarif Rupiah. */
  value: number;
  /** Estimasi hari, mis. "2-3". */
  etd: string;
}

interface CostApiResult {
  code: string;
  name: string;
  costs: { service: string; description: string; cost: { value: number; etd: string; note: string }[] }[];
}

/**
 * Hitung ongkir. NOTED: hasil cost DILARANG di-cache (docs) — selalu
 * request langsung agar tarif akurat.
 */
export async function calculateCost(params: {
  origin: string;
  destination: string;
  /** Berat gram, integer. */
  weight: number;
  courier: StarterCourier;
}): Promise<CostOption[]> {
  if (!params.origin?.trim() || !params.destination?.trim()) {
    throw new Error("origin & destination wajib ID kota (lihat /api/shipping/cities)");
  }
  if (!Number.isInteger(params.weight) || params.weight <= 0) {
    throw new Error("weight wajib gram bilangan bulat > 0");
  }
  if (!STARTER_COURIERS.includes(params.courier)) {
    throw new Error(`courier Starter hanya: ${STARTER_COURIERS.join(", ")}`);
  }

  // NOTED: endpoint cost memakai POST form-urlencoded (bukan JSON).
  const body = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    weight: String(params.weight),
    courier: params.courier,
  });
  const results = await request<CostApiResult[]>("/cost", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  // NOTED: ratakan struktur bertingkat (kurir → service → cost) jadi satu
  // list opsi agar gampang dirender sebagai pilihan di checkout.
  return results.flatMap((r) =>
    r.costs.flatMap((s) =>
      s.cost.map((c) => ({
        courier: r.code,
        service: s.service,
        description: s.description,
        value: c.value,
        etd: c.etd,
      }))
    )
  );
}
