import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

type CartRow = {
  id: number;
  user_id: number;
  status: "active" | "ordered";
  created_at: string;
};

type CountRow = {
  count: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0 });

  const userId = Number(session.user.id);

  // ACTIVE CART
  const [cartRows] = await db.query<CartRow>(
    `SELECT * FROM carts WHERE user_id = $1 AND status = 'active'`,
    [userId]
  );

  const cart = cartRows[0];
  if (!cart) return NextResponse.json({ count: 0 });

  // COUNT ITEMS
  const [itemsRows] = await db.query<CountRow>(
    `SELECT COUNT(*)::text as count FROM cart_items WHERE cart_id = $1`,
    [cart.id]
  );

  const count = Number(itemsRows[0]?.count) || 0;

  return NextResponse.json({ count });
}