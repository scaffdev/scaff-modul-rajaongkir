import { NextResponse } from "next/server";
import { searchDestinations } from "../../../../lib/shipping/rajaongkir";

/**
 * GET /api/shipping/destinations?search=<keyword>&limit=<n> — cari destinasi.
 *
 * NOTED:
 * - Pengganti dropdown cascade V1: satu pencarian mencakup provinsi, kota,
 *   kecamatan, kelurahan, dan kodepos. Ambil `id` dari hasil untuk /cost.
 * - Hasil BOLEH di-cache frontend (data wilayah jarang berubah).
 * - Key tetap di server — browser hanya memanggil route ini.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const limitRaw = searchParams.get("limit");

  if (!search.trim()) {
    return NextResponse.json({ error: "search wajib diisi (nama kota/kecamatan/kodepos)" }, { status: 400 });
  }
  const limit = limitRaw === null ? 10 : Number(limitRaw);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return NextResponse.json({ error: "limit wajib 1-100" }, { status: 400 });
  }

  try {
    const destinations = await searchDestinations(search, { limit });
    return NextResponse.json({ destinations });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal mencari destinasi" },
      { status: 502 }
    );
  }
}
