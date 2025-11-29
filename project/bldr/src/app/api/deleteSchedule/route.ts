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
    const { scheduleId } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { error: "Missing scheduleId" },
        { status: 400 }
      );
    }

    // Verify ownership in userschedule table
    // Check ownership by selecting the scheduleid column (exists in all deployments)
    const { data: ownership, error: ownershipError } = await supabase
      .from("userschedule")
      .select("scheduleid")
      .eq("auth_user_id", user.id)
      .eq("scheduleid", scheduleId)
      .single();

    if (ownershipError || !ownership) {
      console.error(
        "[deleteSchedule] ownership lookup failed:",
        ownershipError
      );
      return NextResponse.json(
        { error: "Schedule not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the schedule. Cascading foreign keys will remove schedule_classes and userschedule entries.
    const { error: deleteError } = await supabase
      .from("allschedules")
      .delete()
      .eq("scheduleid", scheduleId);

    if (deleteError) {
      console.error("[deleteSchedule] delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete schedule" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, scheduleId });
  } catch (error: any) {
    console.error("[deleteSchedule] Unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
