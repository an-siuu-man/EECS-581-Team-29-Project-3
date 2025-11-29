import { supabase } from "../../lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
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

    // 2. Parse request body
    const body = await req.json();
    const { scheduleId, name, semester, year, classes } = body;

    if (!name || !semester || !year) {
      return NextResponse.json(
        { error: "Missing required fields (name, semester, year)" },
        { status: 400 }
      );
    }

    let targetScheduleId = scheduleId;

    // 3. Handle Update or Create
    if (targetScheduleId) {
      // --- UPDATE EXISTING SCHEDULE ---

      // Verify ownership
      const { data: ownership, error: ownershipError } = await supabase
        .from("userschedule")
        .select("scheduleid")
        .eq("auth_user_id", user.id)
        .eq("scheduleid", targetScheduleId)
        .single();

      if (ownershipError || !ownership) {
        return NextResponse.json(
          { error: "Schedule not found or unauthorized" },
          { status: 404 }
        );
      }

      // Update metadata in allschedules
      const { error: updateError } = await supabase
        .from("allschedules")
        .update({
          schedulename: name,
          semester,
          year: parseInt(year),
          lastedited: new Date().toISOString(),
        })
        .eq("scheduleid", targetScheduleId);

      if (updateError) {
        throw new Error(`Failed to update schedule: ${updateError.message}`);
      }

      // Clear existing classes
      const { error: deleteError } = await supabase
        .from("schedule_classes")
        .delete()
        .eq("scheduleid", targetScheduleId);

      if (deleteError) {
        throw new Error(`Failed to clear old classes: ${deleteError.message}`);
      }
    } else {
      // --- CREATE NEW SCHEDULE ---

      // Insert into allschedules
      const { data: newSchedule, error: createError } = await supabase
        .from("allschedules")
        .insert({
          schedulename: name,
          semester,
          year: parseInt(year),
        })
        .select("scheduleid")
        .single();

      if (createError || !newSchedule) {
        throw new Error(`Failed to create schedule: ${createError.message}`);
      }

      targetScheduleId = newSchedule.scheduleid;

      // Link to user in userschedule
      const { error: linkError } = await supabase.from("userschedule").insert({
        auth_user_id: user.id,
        scheduleid: targetScheduleId,
        isactive: true,
      });

      if (linkError) {
        throw new Error(
          `Failed to link user to schedule: ${linkError.message}`
        );
      }
    }

    // 4. Insert classes into schedule_classes
    if (classes && classes.length > 0) {
      const classRows = classes.map((cls: any) => ({
        scheduleid: targetScheduleId,
        class_uuid: cls.uuid, // Assuming the class object has a uuid field
      }));

      const { error: insertClassesError } = await supabase
        .from("schedule_classes")
        .insert(classRows);

      if (insertClassesError) {
        throw new Error(
          `Failed to insert classes: ${insertClassesError.message}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      scheduleId: targetScheduleId,
      message: "Schedule saved successfully",
    });
  } catch (error: any) {
    console.error("Save schedule error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
