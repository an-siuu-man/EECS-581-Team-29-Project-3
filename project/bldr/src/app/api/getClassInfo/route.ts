import { supabase } from "../../lib/supabaseClient";

function parseTimeToFloat(start: string, end: string): number {
  const to24 = (timeStr: string): number => {
    // If already in 24-hour format (e.g., "13:30") or missing AM/PM, just parse as is
    if (!/AM|PM/i.test(timeStr)) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours + (minutes || 0) / 60;
    }
    // Otherwise, convert from 12-hour format with AM/PM
    const [time, meridian] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (meridian.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;
    return hours + (minutes || 0) / 60;
  };

  try {
    return parseFloat((to24(end) - to24(start)).toFixed(2));
  } catch {
    return 0;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, term } = body;

    if (!subject) {
      return Response.json({ error: "Missing subject" }, { status: 400 });
    }

    // Parse subject into dept and code (e.g., "EECS 581" -> dept="EECS", code="581")
    const parts = subject.trim().split(/\s+/);
    if (parts.length < 2) {
      return Response.json(
        { error: 'Invalid subject format. Expected "DEPT CODE"' },
        { status: 400 }
      );
    }

    const dept = parts[0];
    const code = parts[1];

    // Fetch all sections for this course from the database
    const { data: sections, error: fetchErr } = await supabase
      .from("allclasses")
      .select("*")
      .eq("dept", dept)
      .eq("code", code)
      .order("component", { ascending: true })
      .order("classid", { ascending: true });

    if (fetchErr) {
      console.error("❌ Database fetch error:", fetchErr);
      return Response.json(
        { error: "Database query failed", details: fetchErr.message },
        { status: 500 }
      );
    }

    if (!sections || sections.length === 0) {
      return Response.json({ success: true, data: [] }, { status: 200 });
    }

    // Group sections by course
    const courseSections = sections.map((section) => {
      const duration = parseTimeToFloat(
        section.starttime || "",
        section.endtime || ""
      );

      return {
        classID: section.classid.toString(),
        uuid: section.uuid,
        component: section.component,
        starttime: section.starttime,
        endtime: section.endtime,
        days: section.days,
        instructor: section.instructor,
        seats_available: section.availseats ?? 0,
        room: section.room,
        location: section.location,
        credithours: section.credithours,
        duration,
      };
    });

    // Build response with course info and its sections
    const responseToFrontend = [
      {
        dept: sections[0].dept,
        code: sections[0].code,
        title: sections[0].title,
        description: null, // Description not stored in DB
        
        sections: courseSections,
      },
    ];

    return Response.json(
      { success: true, data: responseToFrontend },
      { status: 200 }
    );
  } catch (err) {
    console.error("getClassInfo server error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: "Server error", details: errorMessage },
      { status: 500 }
    );
  }
}
