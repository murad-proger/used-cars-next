import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { RowDataPacket } from "mysql2";
import { Product } from "@/@types/product";

type CartRow = RowDataPacket & {
  id: number;
  user_id: number;
  status: "active" | "ordered";
  created_at: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number(session.user.id);

  // Активная корзина пользователя
  const [cartRows] = await db.query<CartRow[]>(
    `SELECT * FROM carts WHERE user_id = ? AND status = 'active'`,
    [userId]
  );
  const cart = cartRows[0];
  if (!cart) return NextResponse.json({ items: [] });

  // Товары из корзины
  const [itemsRows] = await db.query<RowDataPacket[]>(
    `SELECT p.* 
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = ?`,
    [cart.id]
  );

  // Приведение к Product[] безопасно
  const items: Product[] = itemsRows.map((row) => {
    let images: string[] = [];

    if (row.images) {
      try {
        // Если в базе хранится JSON-массив
        const parsed = JSON.parse(row.images);
        images = Array.isArray(parsed) ? parsed : [String(row.images)];
      } catch {
        // Если обычная строка через запятую
        images = String(row.images).split(",").map((url) => url.trim());
      }
    }

    return {
      id: Number(row.id),
      brand: String(row.brand),
      model: String(row.model),
      year: Number(row.year),
      mileage: Number(row.mileage),
      displacement: String(row.displacement),
      engineType: String(row.engineType),
      transmission: String(row.transmission),
      drivetrain: String(row.drivetrain),
      bodyType: String(row.bodyType),
      color: String(row.color),
      steeringWheel: String(row.steeringWheel),
      price: Number(row.price),
      images,
      description: String(row.description),
      liked: Number(row.liked),
      popular: Number(row.popular),
      raiting: Number(row.raiting),
      added: Number(row.added),
    };
  });

  return NextResponse.json({ items });
}