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
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const body = await req.json();
    const productId = Number(body.productId);

    if (!productId) {
      return NextResponse.json(
        { error: "Invalid productId" },
        { status: 400 }
      );
    }

    const [cartRows] = await db.query<CartRow>(
      `SELECT * FROM carts WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    let cart = cartRows[0];

    if (!cart) {
      const [created] = await db.query<CartRow>(
        `INSERT INTO carts (user_id, status)
         VALUES ($1, 'active')
         RETURNING id, user_id, status, created_at`,
        [userId]
      );

      cart = created[0];
    }

    if (!cart) {
      return NextResponse.json(
        { error: "Cart creation failed" },
        { status: 500 }
      );
    }

    const [existing] = await db.query<{ id: number }>(
      `SELECT id FROM cart_items
       WHERE cart_id = $1 AND product_id = $2`,
      [cart.id, productId]
    );

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO cart_items (cart_id, product_id)
         VALUES ($1, $2)`,
        [cart.id, productId]
      );

      await db.query(
        `UPDATE products SET added = 1 WHERE id = $1`,
        [productId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CART ADD ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}