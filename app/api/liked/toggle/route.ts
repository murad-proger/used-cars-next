import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // текущее значение liked
  const { data: current, error: fetchError } = await supabase
    .from("products")
    .select("liked")
    .eq("id", productId)
    .single();

  if (fetchError || !current) {
    console.error(fetchError);
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  // переключаем значение
  const newLiked = current.liked === 1 ? 0 : 1;

  // обновляем
  const { error: updateError } = await supabase
    .from("products")
    .update({ liked: newLiked })
    .eq("id", productId);

  if (updateError) {
    console.error(updateError);
    return NextResponse.json(
      { error: "Failed to update like" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, liked: newLiked });
}