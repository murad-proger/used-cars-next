import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const userId = Number(session.user.id);

  // ACTIVE CART
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (cartError || !cart) {
    return NextResponse.json({ count: 0 });
  }

  // COUNT ITEMS
  const { count, error: countError } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("cart_id", cart.id);

  if (countError) {
    console.error("COUNT ERROR:", countError);
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({
    count: count ?? 0,
  });
}