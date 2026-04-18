import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Product } from "@/@types/product";

type InsertedProduct = {
  id: number;
};

export async function POST(req: NextRequest) {
  try {
    const body: Partial<Product> = await req.json();

    const {
      brand,
      model,
      year,
      mileage,
      displacement,
      engineType,
      transmission,
      drivetrain,
      bodyType,
      color,
      steeringWheel,
      price,
      images,
      description,
      raiting,
    } = body;

    // обязательные поля
    if (!brand || !model || !year || !price) {
      return NextResponse.json(
        { error: "Не все обязательные поля заполнены" },
        { status: 400 }
      );
    }

    // нормализация images
    const safeImages = Array.isArray(images) ? images : [];

    const [rows] = await db.query<InsertedProduct>(
      `INSERT INTO products
      (brand, model, year, mileage, displacement, engineType, transmission, drivetrain, bodyType, color, steeringWheel, price, images, description, raiting)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id`,
      [
        brand,
        model,
        Number(year),
        Number(mileage) || 0,
        displacement || "",
        engineType || "",
        transmission || "",
        drivetrain || "",
        bodyType || "",
        color || "",
        steeringWheel || "",
        Number(price),
        JSON.stringify(safeImages),
        description || "",
        Number(raiting) || 0,
      ]
    );

    const inserted = rows[0];

    return NextResponse.json({
      message: "Продукт создан",
      id: inserted.id,
    });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);

    return NextResponse.json(
      { error: "Ошибка при создании продукта" },
      { status: 500 }
    );
  }
}