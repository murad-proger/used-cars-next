import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
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

    // GET ACTIVE CART
    const { data: cartRows, error: cartError } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active");

    if (cartError) {
      console.error(cartError);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }

    let cart: CartRow | undefined = cartRows?.[0];

    // CREATE CART IF NOT EXISTS
    if (!cart) {
      const { data: created, error: createError } = await supabase
        .from("carts")
        .insert({
          user_id: userId,
          status: "active",
        })
        .select("*")
        .single();

      if (createError || !created) {
        return NextResponse.json(
          { error: "Cart creation failed" },
          { status: 500 }
        );
      }

      cart = created;
    }

    if (!cart) {
      return NextResponse.json(
        { error: "Cart creation failed" },
        { status: 500 }
      );
    }

    // CHECK IF ITEM EXISTS
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id")
      .eq("cart_id", cart.id)
      .eq("product_id", productId);

    if (!existing || existing.length === 0) {
      // INSERT ITEM
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cart.id,
          product_id: productId,
        });

      if (insertError) {
        console.error(insertError);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      }

      // UPDATE PRODUCT FLAG
      const { error: updateError } = await supabase
        .from("products")
        .update({ added: 1 })
        .eq("id", productId);

      if (updateError) {
        console.error(updateError);
        return NextResponse.json(
          { error: "Internal Server Error" },
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