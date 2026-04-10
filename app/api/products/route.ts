import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ResultSetHeader } from "mysql2";
import { Product } from "@/@types/product";

export async function POST(req: NextRequest) {
  try {
    // читаем тело запроса
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

    // проверка обязательных полей
    if (!brand || !model || !year || !price) {
      return NextResponse.json(
        { error: "Не все обязательные поля заполнены" },
        { status: 400 }
      );
    }

    // вставляем в базу
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO products
       (brand, model, year, mileage, displacement, engineType, transmission, drivetrain, bodyType, color, steeringWheel, price, images, description, raiting)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        brand,
        model,
        year,
        mileage || 0,
        displacement || "",
        engineType || "",
        transmission || "",
        drivetrain || "",
        bodyType || "",
        color || "",
        steeringWheel || "",
        price,
        JSON.stringify(images || []),
        description || "",
        raiting || 0,
      ]
    );

    return NextResponse.json({
      message: "Продукт создан",
      id: result.insertId, // теперь TypeScript знает insertId
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Ошибка при создании продукта" },
      { status: 500 }
    );
  }
}