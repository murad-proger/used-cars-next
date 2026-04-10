import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Тип для строки корзины из базы
type CartRow = RowDataPacket & {
  id: number;
  user_id: number;
  status: "active" | "ordered";
  created_at: string;
};

// Тип для создаваемой вручную корзины
type Cart = {
  id: number;
  user_id: number;
  status: "active" | "ordered";
  created_at: string;
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Приводим userId к числу, т.к. в базе INT
  const userId = Number(session.user.id);

  const { productId } = await req.json();

  // SELECT активной корзины
  const [cartRows] = await db.query<CartRow[]>(
    `SELECT * FROM carts WHERE user_id = ? AND status = 'active'`,
    [userId]
  );

  // Переменная cart может быть либо CartRow из базы, либо Cart созданная вручную
  let cart: CartRow | Cart = cartRows[0];

  // Если нет корзины — создаем
  if (!cart) {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO carts (user_id) VALUES (?)`,
      [userId]
    );

    cart = {
      id: Number(result.insertId), // приводим insertId к number
      user_id: userId,
      status: "active",
      created_at: new Date().toISOString(),
    };
  }

  // Проверяем, есть ли товар уже в корзине
  const [existingRows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?`,
    [cart.id, productId]
  );

  if (existingRows.length === 0) {
    await db.query(
      `INSERT INTO cart_items (cart_id, product_id) VALUES (?, ?)`,
      [cart.id, productId]
    );
    await db.query(`UPDATE products SET added = 1 WHERE id = ?`, [productId]);
  }

  return NextResponse.json({ success: true });
}
