import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const { productId } = await req.json();
    const parsedProductId = Number(productId);

    if (!parsedProductId) {
      return NextResponse.json(
        { error: "Invalid productId" },
        { status: 400 }
      );
    }

    // GET ACTIVE CART
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (cartError || !cart) {
      console.error("CART ERROR:", cartError);
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    // DELETE ITEM FROM CART
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)
      .eq("product_id", parsedProductId);

    if (deleteError) {
      console.error("DELETE ERROR:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove item" },
        { status: 500 }
      );
    }

    // UPDATE PRODUCT STATE
    const { error: updateError } = await supabase
      .from("products")
      .update({ added: 0 })
      .eq("id", parsedProductId);

    if (updateError) {
      console.error("PRODUCT UPDATE ERROR:", updateError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CART REMOVE ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}