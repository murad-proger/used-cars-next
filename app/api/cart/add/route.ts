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

    const body = await req.json();
    const productId = Number(body.productId);

    if (!productId) {
      return NextResponse.json(
        { error: "Invalid productId" },
        { status: 400 }
      );
    }

    // GET OR CREATE CART (active)
    const { data: cartRows, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1);

    if (cartError) {
      console.error("CART ERROR:", cartError);
      return NextResponse.json(
        { error: "Failed to get cart" },
        { status: 500 }
      );
    }

    let cart = cartRows?.[0];

    if (!cart) {
      const { data: created, error: createError } = await supabase
        .from("carts")
        .insert({
          user_id: userId,
          status: "active",
        })
        .select("id")
        .single();

      if (createError || !created) {
        console.error("CREATE CART ERROR:", createError);
        return NextResponse.json(
          { error: "Cart creation failed" },
          { status: 500 }
        );
      }

      cart = created;
    }

    // check existing item
    const { data: existing, error: existingError } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("cart_id", cart.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingError) {
      console.error("EXISTING ERROR:", existingError);
      return NextResponse.json(
        { error: "Failed to check item" },
        { status: 500 }
      );
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: existing.quantity + 1,
        })
        .eq("cart_id", cart.id)
        .eq("product_id", productId);

      if (updateError) {
        console.error("UPDATE ERROR:", updateError);
        return NextResponse.json(
          { error: "Failed to update item" },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cart.id,
          product_id: productId,
          quantity: 1,
        });

      if (insertError) {
        console.error("INSERT ERROR:", insertError);
        return NextResponse.json(
          { error: "Failed to add item" },
          { status: 500 }
        );
      }
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