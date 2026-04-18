import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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
  engineType: string;
  transmission: string;
  drivetrain: string;
  bodyType: string;
  color: string;
  steeringWheel: string;
  price: number;
  images: string;
  description: string | null;
  liked: number;
  popular: number;
  raiting: number;
  added: number;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = Number(session.user.id);

  // 1. CART
  const [cartRows] = await db.query<CartRow>(
    `SELECT * FROM carts WHERE user_id = $1 AND status = 'active'`,
    [userId]
  );

  const cart = cartRows[0];

  if (!cart) {
    return NextResponse.json({ items: [] });
  }

  // 2. PRODUCTS
  const [itemsRows] = await db.query<ProductRow>(
    `SELECT p.*
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = $1`,
    [cart.id]
  );

  const items: Product[] = itemsRows.map((row) => {
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
      engineType: row.engineType,
      transmission: row.transmission,
      drivetrain: row.drivetrain,
      bodyType: row.bodyType,
      color: row.color,
      steeringWheel: row.steeringWheel,
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