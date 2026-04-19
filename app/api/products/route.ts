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

    if (!brand || !model || !year || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

        enginetype: engineType || "",
        transmission: transmission || "",
        drivetrain: drivetrain || "",
        bodytype: bodyType || "",
        color: color || "",
        steeringwheel: steeringWheel || "",

        price: Number(price),
        images: Array.isArray(images) ? images : [],
        description: description || "",
        raiting: Number(raiting) || 0,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("CREATE ERROR:", error);
      return NextResponse.json(
        { error: "Create failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Created",
      id: data.id,
    });
  } catch (err) {
    console.error("POST ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}