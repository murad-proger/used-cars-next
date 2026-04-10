import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { productId } = await req.json();

  await db.query(
    `UPDATE products
     SET liked = IF(liked = 1, 0, 1)
     WHERE id = ?`,
    [productId]
  );

  return NextResponse.json({ success: true });
}