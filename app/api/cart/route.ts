import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { Product } from "@/@types/product";

type CartRow = {
  id: number;
  user_id: number;
  status: "active" | "ordered";
  created_at: string;
};

type ProductRow = {
  id: number;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  displacement: string;
  enginetype: string;
  transmission: string;
  drivetrain: string;
  bodytype: string;
  color: string;
  steeringwheel: string;
  price: number;
  images: string;
  description: string | null;
  liked: number;
  popular: number;
  raiting: number;
  added: number;
};

type CartItemJoin = {
  products: ProductRow[];
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = Number(session.user.id);

  // выбираем ВСЕ поля под CartRow
  const { data: cartRows, error: cartError } = await supabase
    .from("carts")
    .select("id, user_id, status, created_at")
    .eq("user_id", userId)
    .eq("status", "active");

  if (cartError) {
    console.error("CART ERROR:", cartError);
    return NextResponse.json({ items: [] });
  }

  const cart: CartRow | undefined = cartRows?.[0];

  if (!cart) {
    return NextResponse.json({ items: [] });
  }

  const { data: itemsRows, error: itemsError } = await supabase
    .from("cart_items")
    .select(`
      product_id,
      quantity,
      products (
        id,
        brand,
        model,
        year,
        mileage,
        displacement,
        enginetype,
        transmission,
        drivetrain,
        bodytype,
        color,
        steeringwheel,
        price,
        images,
        description,
        liked,
        popular,
        raiting,
        added
      )
    `)
    .eq("cart_id", cart.id);

  if (itemsError) {
    console.error("ITEMS ERROR:", itemsError);
    return NextResponse.json({ items: [] });
  }

  const products = (itemsRows ?? [])
    .flatMap((item) => (item as CartItemJoin).products)
    .filter((p): p is ProductRow => p !== undefined);

  const items: Product[] = products.map((row) => {
    let images: string[] = [];

    if (row.images) {
      try {
        const parsed = JSON.parse(row.images);
        images = Array.isArray(parsed)
          ? parsed
          : [String(row.images)];
      } catch {
        images = String(row.images)
          .split(",")
          .map((url) => url.trim());
      }
    }

    return {
      id: row.id,
      brand: row.brand,
      model: row.model,
      year: row.year,
      mileage: row.mileage,
      displacement: row.displacement,
      engineType: row.enginetype,
      transmission: row.transmission,
      drivetrain: row.drivetrain,
      bodyType: row.bodytype,
      color: row.color,
      steeringWheel: row.steeringwheel,
      price: row.price,
      images,
      description: row.description ?? "",
      liked: row.liked,
      popular: row.popular,
      raiting: row.raiting,
      added: row.added,
    };
  });

  return NextResponse.json({ items });
}