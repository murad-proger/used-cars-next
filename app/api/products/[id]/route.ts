// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest) {
  // вытаскиваем id из URL
  const url = req.nextUrl.pathname; // "/api/products/1"
  const idStr = url.split("/").pop(); // берём последний сегмент
  const id = Number(idStr);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const body = await req.json();
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

    await db.execute(
      `UPDATE products
       SET brand=?, model=?, year=?, mileage=?, displacement=?, engineType=?, transmission=?, drivetrain=?, bodyType=?, color=?, steeringWheel=?, price=?, images=?, description=?, raiting=?
       WHERE id=?`,
      [
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
        JSON.stringify(images),
        description,
        raiting,
        id,
      ]
    );

    return NextResponse.json({ message: "Продукт обновлён" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка при обновлении продукта" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const idStr = url.split("/").pop();
  const id = Number(idStr);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await db.execute("DELETE FROM products WHERE id=?", [id]);
    return NextResponse.json({ message: "Продукт удалён" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка при удалении продукта" }, { status: 500 });
  }
}