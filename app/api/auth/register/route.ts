import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // password rules
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password is too weak (min 6 chars)" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "USER",
      })
      .select("id, email");

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "User already exists" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: "Database error" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: "User not created" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "User created",
        user: data[0],
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("REGISTER CATCH ERROR:", err);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}