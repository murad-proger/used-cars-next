import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/@types/product";
import { createClient } from "@supabase/supabase-js";

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("products")
      .insert({
        brand,
        model,
        year: Number(year),
        mileage: Number(mileage) || 0,
        displacement: displacement || "",
        engineType: engineType || "",
        transmission: transmission || "",
        drivetrain: drivetrain || "",
        bodyType: bodyType || "",
        color: color || "",
        steeringWheel: steeringWheel || "",
        price: Number(price),
        images: safeImages, // ⚠️ см. ниже
        description: description || "",
        raiting: Number(raiting) || 0,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("CREATE PRODUCT ERROR:", error);
      return NextResponse.json(
        { error: "Ошибка при создании продукта" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Продукт создан",
      id: data.id,
    });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);

    return NextResponse.json(
      { error: "Ошибка при создании продукта" },
      { status: 500 }
    );
  }
}