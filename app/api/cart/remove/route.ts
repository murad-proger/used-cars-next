import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

type CartRow = {
  id: number;
  user_id: number;
  status: "active" | "ordered";
  created_at: string;
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = Number(session.user.id);
  const { productId } = await req.json();

  // 1. Получаем активную корзину
  const [cartRows] = await db.query<CartRow>(
    `SELECT * FROM carts WHERE user_id = $1 AND status = 'active'`,
    [userId]
  );

  const cart = cartRows[0];

  if (!cart) {
    return NextResponse.json(
      { error: "Cart not found" },
      { status: 404 }
    );
  }

  // 2. Удаляем товар из корзины
  await db.query(
    `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
    [cart.id, productId]
  );

  // 3. Обновляем флаг товара
  await db.query(
    `UPDATE products SET added = 0 WHERE id = $1`,
    [productId]
  );

  return NextResponse.json({ success: true });
}