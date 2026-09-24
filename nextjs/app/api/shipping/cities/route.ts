import { NextResponse } from "next/server";
import { getCities } from "../../../../../lib/shipping/rajaongkir";

/**
 * GET /api/shipping/cities?province=<id> — daftar kota/kabupaten.
 *
 * NOTED:
 * - Dipakai untuk dropdown cascade: pilih provinsi → isi dropdown kota.
 * - Tanpa ?province= → semua kota (berat, ~500 records). Frontend sebaiknya
 *   selalu kirim province agar respons ringan.
 * - Key tetap di server — browser hanya memanggil route ini.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const province = searchParams.get("province") ?? undefined;

  try {
    const cities = await getCities(province);
    return NextResponse.json({ cities });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memuat kota" },
      { status: 502 }
    );
  }
}
