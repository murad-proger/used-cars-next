import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { productId } = await req.json();

  // Получаем активную корзину пользователя
  const [cartRows] = await db.query<CartRow[]>(
    `SELECT * FROM carts WHERE user_id = ? AND status = 'active'`,
    [userId]
  );
  const cart = cartRows[0];
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  // Удаляем товар из cart_items
  await db.query(
    `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`,
    [cart.id, productId]
  );

  // Обновляем флаг added
  await db.query(`UPDATE products SET added = 0 WHERE id = ?`, [productId]);

  return NextResponse.json({ success: true });
}
