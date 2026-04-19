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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0 });

  const userId = Number(session.user.id);

  // активная корзина
  const { data: cartRows, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");

  if (cartError) {
    console.error(cartError);
    return NextResponse.json({ count: 0 });
  }

  const cart = (cartRows as CartRow[] | null)?.[0];
  if (!cart) return NextResponse.json({ count: 0 });

  // COUNT ITEMS
  const { count, error: countError } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("cart_id", cart.id);

  if (countError) {
    console.error(countError);
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: count || 0 });
}