import { supabase } from "../../lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization header" },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { scheduleId, newName } = body;

    if (!scheduleId || !newName) {
      return NextResponse.json(
        { error: "Missing scheduleId or newName" },
        { status: 400 }
      );
    }

    // Verify ownership in userschedule table
    const { data: ownership, error: ownershipError } = await supabase
      .from("userschedule")
      .select("scheduleid")
      .eq("auth_user_id", user.id)
      .eq("scheduleid", scheduleId)
      .single();

    if (ownershipError || !ownership) {
      console.error(
        "[renameSchedule] ownership lookup failed:",
        ownershipError
      );
      return NextResponse.json(
        { error: "Schedule not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update schedule name in allschedules table
    const { data, error } = await supabase
      .from("allschedules")
      .update({ schedulename: newName })
      .eq("scheduleid", scheduleId)
      .select()
      .single();

    if (error) {
      console.error("Error renaming schedule:", error);
      return NextResponse.json(
        { error: "Failed to rename schedule" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Schedule renamed successfully",
      schedule: data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
