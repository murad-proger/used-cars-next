import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { RowDataPacket } from "mysql2";

type CartRow = RowDataPacket & {
  id: number;
  user_id: number;
  status: "active" | "ordered";
  created_at: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0 });

  const userId = Number(session.user.id);

  // Получаем активную корзину пользователя
  const [cartRows] = await db.query<CartRow[]>(
    `SELECT * FROM carts WHERE user_id = ? AND status = 'active'`,
    [userId]
  );

  const cart = cartRows[0];
  if (!cart) return NextResponse.json({ count: 0 });

  // Считаем количество товаров в cart_items
  const [items] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ?`,
    [cart.id]
  );

  const count = Number(items[0].count) || 0;

  return NextResponse.json({ count });
}
