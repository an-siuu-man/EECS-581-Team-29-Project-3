import { supabase } from "../../lib/supabaseClient";

type BodyUUID = {
  scheduleid: string; // uuid of schedule
  fromUuid?: string; // uuid in allclasses
  toUuid?: string; // uuid in allclasses
  fromClassId?: number; // int classid (alternative)
  toClassId?: number; // int classid (alternative)
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BodyUUID;
    const { scheduleid } = body;

    // --- basic validation ---------------------------------------------------
    if (!scheduleid) {
      return Response.json({ error: "Missing scheduleid" }, { status: 400 });
    }
    if (
      (!body.fromUuid && body.fromClassId == null) ||
      (!body.toUuid && body.toClassId == null)
    ) {
      return Response.json(
        { error: "Provide fromUuid/toUuid OR fromClassId/toClassId" },
        { status: 400 }
      );
    }

    // --- helper: resolve classid (int) from either uuid or classid ----------
    const resolveClassId = async (uuid?: string, classId?: number) => {
      if (classId != null) return classId;

      if (!uuid) return null;

      const { data, error } = await supabase
        .from("allclasses")
        .select("classid")
        .eq("uuid", uuid)
        .maybeSingle();

      if (error)
        throw new Error(`Failed to look up class by uuid: ${error.message}`);
      return data?.classid ?? null;
    };

    const fromClassId = await resolveClassId(body.fromUuid, body.fromClassId);
    const toClassId = await resolveClassId(body.toUuid, body.toClassId);

    if (fromClassId == null) {
      return Response.json(
        { error: "Source class not found" },
        { status: 404 }
      );
    }
    if (toClassId == null) {
      return Response.json(
        { error: "Target class not found" },
        { status: 404 }
      );
    }
    if (fromClassId === toClassId) {
      return Response.json(
        { error: "Source and target class are the same — nothing to replace" },
        { status: 400 }
      );
    }

    // --- step 1: ensure target mapping exists (idempotent) ------------------
    // Uses the UNIQUE(scheduleid,classid) constraint to avoid duplicates.
    const { error: upsertErr } = await supabase
      .from("scheduleclasses")
      .upsert([{ scheduleid, classid: toClassId }], {
        onConflict: "scheduleid,classid",
        ignoreDuplicates: false,
      });

    if (upsertErr) {
      console.error("[replaceClass] upsert error:", upsertErr);
      return Response.json(
        { error: "Failed to add target class to schedule" },
        { status: 500 }
      );
    }

    // --- step 2: remove the old mapping if it exists ------------------------
    const { error: delErr, count: deletedOld } = await supabase
      .from("scheduleclasses")
      .delete({ count: "exact" })
      .eq("scheduleid", scheduleid)
      .eq("classid", fromClassId);

    if (delErr) {
      console.error("[replaceClass] delete old mapping error:", delErr);
      // roll forward anyway: target is already present, old may not have existed
      return Response.json(
        { error: "Target added, but failed to remove old class" },
        { status: 500 }
      );
    }

    // optional: if nothing was deleted, inform the caller (helps UX)
    const message =
      deletedOld && deletedOld > 0
        ? "Replaced class in schedule."
        : "Target ensured in schedule; source mapping was not present.";

    return Response.json(
      {
        success: true,
        message,
        details: {
          scheduleid,
          fromClassId,
          toClassId,
          deletedOld: deletedOld ?? 0,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[replaceClass] server error:", err);
    return Response.json(
      { error: "Internal server error", details: err?.message },
      { status: 500 }
    );
  }
}
