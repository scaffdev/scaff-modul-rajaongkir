import { NextResponse } from "next/server";
import {
  calculateCost,
  STARTER_COURIERS,
  type StarterCourier,
} from "../../../../../lib/shipping/rajaongkir";

/**
 * POST /api/shipping/cost — hitung ongkir.
 *
 * NOTED: import path RELATIF agar jalan di template base mana pun.
 *
 * Body: { origin: string (city_id), destination: string (city_id),
 *         weight: number (gram), courier: "jne" | "pos" | "tiki" }
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

  if (!str(b.origin)?.trim() || !str(b.destination)?.trim()) {
    return NextResponse.json(
      { error: "origin & destination wajib ID kota (ambil dari /api/shipping/cities)" },
      { status: 400 }
    );
  }
  if (typeof b.weight !== "number" || !Number.isInteger(b.weight) || b.weight <= 0) {
    return NextResponse.json({ error: "weight wajib gram bilangan bulat > 0" }, { status: 400 });
  }
  if (typeof b.courier !== "string" || !STARTER_COURIERS.includes(b.courier as StarterCourier)) {
    return NextResponse.json(
      { error: `courier hanya: ${STARTER_COURIERS.join(", ")} (akun Starter)` },
      { status: 400 }
    );
  }

  try {
    const options = await calculateCost({
      origin: str(b.origin)!.trim(),
      destination: str(b.destination)!.trim(),
      weight: b.weight,
      courier: b.courier as StarterCourier,
    });
    return NextResponse.json({ options });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menghitung ongkir" },
      { status: 502 }
    );
  }
}
