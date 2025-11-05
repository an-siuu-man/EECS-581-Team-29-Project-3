import { supabase } from '../../lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scheduleid } = body;

    if (!scheduleid) {
      return Response.json({ error: 'Missing scheduleid' }, { status: 400 });
    }

    // 1. Select classid and uuid from userschedule where scheduleid = scheduleid
    const { data: userSchedule, error: userScheduleErr } = await supabase
      .from('scheduleclasses')
      .select('classid, uuid')
      .eq('scheduleid', scheduleid);

    if (userScheduleErr || !userSchedule || userSchedule.length === 0) {
      return Response.json({ error: 'No classes found for this scheduleid' }, { status: 404 });
    }

    // 2. Using those classid, get dept and code from allclasses
    const classIds = userSchedule.map(item => item.classid);
    const { data: classInfo, error: classInfoErr } = await supabase
      .from('allclasses')
      .select('classid, dept, code')
      .in('classid', classIds);

    if (classInfoErr || !classInfo) {
      return Response.json({ error: 'Class info fetch failed' }, { status: 500 });
    }

    // 3. Build output: group by dept+code, collect selClass array
    const deptCodeMap: { [key: string]: { classid: string; uuid: string }[] } = {};

    for (const { classid, uuid } of userSchedule) {
      const classRow = classInfo.find(ci => ci.classid === classid);
      if (!classRow) continue;
      const deptcode = `${classRow.dept} ${classRow.code}`;

      if (!deptCodeMap[deptcode]) deptCodeMap[deptcode] = [];
      deptCodeMap[deptcode].push({ classid, uuid });
    }

    // 4. Format output as requested
    const output = Object.entries(deptCodeMap).map(([deptcode, selClass]) => ({
      deptcode,
      selClass
    }));
    console.log('Output:', JSON.stringify(output, null, 2));
    return Response.json(output, { status: 200 });
  } catch (err: any) {
    console.error('Server error:', err);
    return Response.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}


