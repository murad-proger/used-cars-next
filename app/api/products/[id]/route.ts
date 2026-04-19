import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PUT(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const idStr = url.split("/").pop();
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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from("products")
      .update({
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
        images, // ⚠️ см. ниже
        description,
        raiting,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Ошибка при обновлении продукта" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Продукт обновлён" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Ошибка при обновлении продукта" },
      { status: 500 }
    );
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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Ошибка при удалении продукта" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Продукт удалён" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Ошибка при удалении продукта" },
      { status: 500 }
    );
  }
}