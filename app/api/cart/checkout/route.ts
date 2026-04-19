import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

type CartItem = {
  product_id: number;
  quantity: number;
  products: {
    price: number;
  }[] | null;
};

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (cartError || !cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
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
      console.error("ITEMS ERROR:", itemsError);
      return NextResponse.json(
        { error: "Failed to load cart items" },
        { status: 500 }
      );
    }

    // ✔ FIX: правильная проверка пустой корзины
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    const typedItems = items as CartItem[];

    const total = typedItems.reduce((sum, item) => {
      const price = item.products?.[0]?.price ?? 0;
      const qty = item.quantity ?? 1;
      return sum + price * qty;
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
      console.error("PRODUCT UPDATE ERROR:", updateProductsError);
    }

    return NextResponse.json({
      success: true,
      total,
      orderId: cart.id,
    });
  } catch (error) {
    console.error("CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}