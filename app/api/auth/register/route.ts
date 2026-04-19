import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/supabaseClient";

// type UserRow = {
//   id: number;
// };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const { data: existingUsers, error: selectError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email);

    if (selectError) {
      console.error(selectError);
      return NextResponse.json(
        { message: "Server error" },
        { status: 500 }
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error: insertError } = await supabase.from("users").insert({
      name,
      email,
      password: hashedPassword,
      role: "USER",
    });

    if (insertError) {
      console.error(insertError);
      return NextResponse.json(
        { message: "Server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "User created" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}