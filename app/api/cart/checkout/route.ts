import { NextResponse } from "next/server";
import { pg } from "@/lib/db/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

type CartRow = {
  id: number;
  user_id: number;
  status: "active" | "ordered";
  created_at: string;
};

type CartItemRow = {
  product_id: number;
  quantity: number;
  price: number;
};

export async function POST() {
  const client = await pg.connect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    await client.query("BEGIN");

    const cartResult = await client.query<CartRow>(
      `SELECT * FROM carts 
       WHERE user_id = $1 AND status = 'active'
       FOR UPDATE`,
      [userId]
    );

    const cart: CartRow | undefined = cartResult.rows[0];

    if (!cart) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const itemsResult = await client.query<CartItemRow>(
      `SELECT ci.product_id, ci.quantity, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cart.id]
    );

    const items: CartItemRow[] = itemsResult.rows;

    if (items.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const total = items.reduce((sum: number, item: CartItemRow) => {
      return sum + item.price * (item.quantity ?? 1);
    }, 0);

    await client.query(
      `UPDATE carts SET status = 'ordered' WHERE id = $1`,
      [cart.id]
    );

    await client.query(
      `UPDATE products 
       SET added = 0 
       WHERE id IN (
         SELECT product_id FROM cart_items WHERE cart_id = $1
       )`,
      [cart.id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      orderId: cart.id,
      total,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}