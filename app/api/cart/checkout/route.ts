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

export async function POST() {
  const connection = await db.getConnection();

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    await connection.beginTransaction();

    // 1. Получаем активную корзину
    const [cartRows] = await connection.query<CartRow[]>(
      `SELECT * FROM carts WHERE user_id = ? AND status = 'active' FOR UPDATE`,
      [userId]
    );

    const cart = cartRows[0];

    if (!cart) {
      await connection.rollback();
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // 2. Получаем товары + цену + quantity
    const [items] = await connection.query<RowDataPacket[]>(
      `SELECT ci.product_id, ci.quantity, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [cart.id]
    );

    if (items.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 3. Считаем total
    const total = items.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity || 1);
    }, 0);

    // 4. Меняем статус корзины → ordered
    await connection.query(
      `UPDATE carts SET status = 'ordered' WHERE id = ?`,
      [cart.id]
    );

    // 5. (опционально) сбрасываем added у товаров
    await connection.query(
      `UPDATE products 
       SET added = 0 
       WHERE id IN (
         SELECT product_id FROM cart_items WHERE cart_id = ?
       )`,
      [cart.id]
    );

    // 6. Коммит
    await connection.commit();

    return NextResponse.json({
      success: true,
      orderId: cart.id,
      total,
    });
  } catch (error) {
    await connection.rollback();

    console.error("CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}