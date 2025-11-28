import { supabase } from "../../lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scheduleid, uuid } = body;

    console.log("[Request Body]", body); // 🖨️ Log incoming body

    if (!scheduleid || !uuid) {
      return Response.json(
        { error: "Missing scheduleid or uuid" },
        { status: 400 }
      );
    }

    // 🖨️ Log query for classid
    const { data: classData, error: fetchError } = await supabase
      .from("allclasses")
      .select("classid")
      .eq("uuid", uuid)
      .maybeSingle();

    console.log("[Class Lookup]", { classData, fetchError });

    if (fetchError || !classData) {
      return Response.json(
        { error: "Class not found for given uuid" },
        { status: 404 }
      );
    }

    const classid = classData.classid;

    // Log deletion attempt
    const { error: deleteError } = await supabase
      .from("schedule_classes")
      .delete()
      .eq("scheduleid", scheduleid)
      .eq("class_uuid", uuid);

    console.log("[Delete Result]", { scheduleid, classid, deleteError });

    if (deleteError) {
      return Response.json(
        { error: "Failed to remove class" },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: "Class successfully removed from schedule" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Server error:", err);
    return Response.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
