import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// type CartRow = {
//   id: number;
//   user_id: number;
//   status: "active" | "ordered";
//   created_at: string;
// };

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // активная корзина
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (cartError || !cart) {
    return NextResponse.json(
      { error: "Cart not found" },
      { status: 404 }
    );
  }

  // Удаляем товар
  const { error: deleteError } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id)
    .eq("product_id", productId);

  if (deleteError) {
    console.error(deleteError);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ added: 0 })
    .eq("id", productId);

  if (updateError) {
    console.error(updateError);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}