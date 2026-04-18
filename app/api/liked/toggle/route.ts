import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { productId } = await req.json();

await db.query(
  `UPDATE products
   SET liked = CASE WHEN liked = 1 THEN 0 ELSE 1 END
   WHERE id = $1`,
  [productId]
);

  return NextResponse.json({ success: true });
}