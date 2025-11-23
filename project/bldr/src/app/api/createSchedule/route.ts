import { createClient } from "@/lib/supabase/server";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const { scheduleName, semester, year } = await req.json();

  // Create server-side Supabase client with user's session
  const supabase = await createClient();

  // Get the authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth error:", authError);
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // insert into allSchedules
  const { data: sched, error: e1 } = await supabase
    .from("allschedules")
    .insert({
      scheduleid: uuid(),
      schedulename: scheduleName,
      semester: semester,
      year: year,
    })
    .select()
    .single();

  if (e1) {
    console.error("Error creating schedule:", e1);
    return Response.json({ error: e1.message, details: e1 }, { status: 500 });
  }

  // link in userSchedule with auth_user_id
  const { data: link, error: e2 } = await supabase
    .from("userschedule")
    .insert({
      scheduleid: sched.scheduleid,
      isactive: true,
      auth_user_id: user.id,
    })
    .select()
    .single();

  if (e2) {
    console.error("Error linking user schedule:", e2);
    return Response.json({ error: e2.message, details: e2 }, { status: 500 });
  }

  return Response.json({ schedule: sched, userSchedule: link });
}
