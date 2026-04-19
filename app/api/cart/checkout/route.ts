import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

type CartRow = {
  id: number;
  user_id: number;
  status: "active" | "ordered";
  created_at: string;
};

type CartItemWithProduct = {
  product_id: number;
  quantity: number;
  products: {
    price: number;
  }[];
};

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const { data: cartRows, error: cartError } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active");

    if (cartError) {
      console.error(cartError);
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cart: CartRow | undefined = cartRows?.[0];

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select(`
        product_id,
        quantity,
        products (
          price
        )
      `)
      .eq("cart_id", cart.id);

    if (itemsError) {
      console.error(itemsError);
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const typedItems = items as CartItemWithProduct[];

    if (!typedItems || typedItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const total = typedItems.reduce((sum, item) => {
      const price = item.products?.[0]?.price;
      if (!price) return sum;

      return sum + price * (item.quantity ?? 1);
    }, 0);

    const { error: updateCartError } = await supabase
      .from("carts")
      .update({ status: "ordered" })
      .eq("id", cart.id);

    if (updateCartError) {
      console.error(updateCartError);
      return NextResponse.json(
        { error: "Checkout failed" },
        { status: 500 }
      );
    }

    const productIds = typedItems.map((i) => i.product_id);

    const { error: updateProductsError } = await supabase
      .from("products")
      .update({ added: 0 })
      .in("id", productIds);

    if (updateProductsError) {
      console.error(updateProductsError);
      return NextResponse.json(
        { error: "Checkout failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: cart.id,
      total,
    });
  } catch (error) {
    console.error("CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}