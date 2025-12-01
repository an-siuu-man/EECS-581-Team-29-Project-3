import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Use Supabase anonymous sign-in for guest users
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "Guest login successful",
        user: data.user,
        session: data.session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Guest login error:", error);
    return NextResponse.json(
      { error: "An error occurred during guest login" },
      { status: 500 }
    );
  }
}
