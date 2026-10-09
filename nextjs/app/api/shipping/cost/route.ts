import { NextResponse } from "next/server";
import {
  calculateCost,
  SUPPORTED_COURIERS,
} from "../../../../lib/shipping/rajaongkir";

/**
 * POST /api/shipping/cost — hitung ongkir (RajaOngkir V2).
 *
 * NOTED: import path RELATIF agar jalan di template base mana pun.
 *
 * Body: { origin: number (ID destinasi), destination: number (ID destinasi),
 *         weight: number (gram), courier: string ("jne" atau "jne:sicepat:pos"),
 *         price?: "lowest" | "highest" }
 * Balikan: [{ courier, service, description, value, etd }]
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);

  if (typeof b.origin !== "number" || !Number.isInteger(b.origin) || typeof b.destination !== "number" || !Number.isInteger(b.destination)) {
    return NextResponse.json(
      { error: "origin & destination wajib ID destinasi (ambil dari /api/shipping/destinations)" },
      { status: 400 }
    );
  }
  if (typeof b.weight !== "number" || !Number.isInteger(b.weight) || b.weight <= 0) {
    return NextResponse.json({ error: "weight wajib gram bilangan bulat > 0" }, { status: 400 });
  }
  if (typeof b.courier !== "string" || !b.courier.trim()) {
    return NextResponse.json({ error: "courier wajib diisi" }, { status: 400 });
  }
  if (b.price !== undefined && b.price !== "lowest" && b.price !== "highest") {
    return NextResponse.json({ error: 'price hanya "lowest" | "highest"' }, { status: 400 });
  }

  try {
    const options = await calculateCost({
      origin: b.origin,
      destination: b.destination,
      weight: b.weight,
      courier: str(b.courier)!.trim().toLowerCase(),
      price: b.price === "lowest" || b.price === "highest" ? b.price : undefined,
    });
    return NextResponse.json({ options });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal menghitung ongkir";
    const status = msg.startsWith("courier tidak didukung") || msg.startsWith("price hanya") ? 400 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
