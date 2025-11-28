import { supabase } from "../../lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scheduleid } = body;

    if (!scheduleid) {
      return Response.json({ error: "Missing scheduleid" }, { status: 400 });
    }

    // 1. Select class_uuid from schedule_classes where scheduleid = scheduleid
    const { data: userSchedule, error: userScheduleErr } = await supabase
      .from("schedule_classes")
      .select("class_uuid")
      .eq("scheduleid", scheduleid);

    if (userScheduleErr || !userSchedule || userSchedule.length === 0) {
      return Response.json(
        { error: "No classes found for this scheduleid" },
        { status: 404 }
      );
    }

    // 2. Using those class_uuid values, get dept, code, classid, and uuid from allclasses
    const classUuids = userSchedule.map((item) => item.class_uuid);
    const { data: classInfo, error: classInfoErr } = await supabase
      .from("allclasses")
      .select("uuid, classid, dept, code")
      .in("uuid", classUuids);

    if (classInfoErr || !classInfo) {
      return Response.json(
        { error: "Class info fetch failed" },
        { status: 500 }
      );
    }

    // 3. Build output: group by dept+code, collect selClass array
    const deptCodeMap: { [key: string]: { classid: string; uuid: string }[] } =
      {};

    for (const { class_uuid } of userSchedule) {
      const classRow = classInfo.find((ci) => ci.uuid === class_uuid);
      if (!classRow) continue;
      const deptcode = `${classRow.dept} ${classRow.code}`;

      if (!deptCodeMap[deptcode]) deptCodeMap[deptcode] = [];
      deptCodeMap[deptcode].push({
        classid: classRow.classid?.toString() || "",
        uuid: classRow.uuid,
      });
    }

    // 4. Format output as requested
    const output = Object.entries(deptCodeMap).map(([deptcode, selClass]) => ({
      deptcode,
      selClass,
    }));
    console.log("Output:", JSON.stringify(output, null, 2));
    return Response.json(output, { status: 200 });
  } catch (err: any) {
    console.error("Server error:", err);
    return Response.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
