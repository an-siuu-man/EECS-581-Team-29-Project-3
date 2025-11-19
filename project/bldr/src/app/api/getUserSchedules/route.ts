import { supabase } from '../../lib/supabaseClient';
import { NextRequest } from 'next/server';

/**
 * GET /api/getUserSchedules
 * Fetch all schedules for the authenticated user using Supabase auth
 */
export async function GET(req: NextRequest) {
  try {
    // Get user ID from Supabase auth session
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return Response.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Extract user from session (Supabase handles this)
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch schedules for this user from userschedule table
    const { data: userScheduleData, error: userScheduleError } = await supabase
      .from('userschedule')
      .select('scheduleid')
      .eq('auth_user_id', user.id)  // Use Supabase auth UUID
      .eq('isactive', true);

    if (userScheduleError) {
      console.error('[getUserSchedules] Error fetching user schedules:', userScheduleError);
      return Response.json({ error: 'Failed to fetch user schedules' }, { status: 500 });
    }

    if (!userScheduleData || userScheduleData.length === 0) {
      return Response.json({ schedules: [] });
    }

    // Get schedule IDs
    const scheduleIds = userScheduleData.map((us: any) => us.scheduleid);

    // Fetch schedule details from allschedules table
    const { data: schedules, error: schedulesError } = await supabase
      .from('allschedules')
      .select('scheduleid, schedulename, semester, year, createdat, lastedited')
      .in('scheduleid', scheduleIds);

    if (schedulesError) {
      console.error('[getUserSchedules] Error fetching schedules:', schedulesError);
      return Response.json({ error: 'Failed to fetch schedule details' }, { status: 500 });
    }

    // For each schedule, fetch its classes
    const schedulesWithClasses = await Promise.all(
      (schedules || []).map(async (schedule: any) => {
        // Get classes for this schedule
        const { data: scheduleClasses, error: classesError } = await supabase
          .from('scheduleclasses')
          .select('uuid, classid')
          .eq('scheduleid', schedule.scheduleid);

        if (classesError) {
          console.error(`[getUserSchedules] Error fetching classes for schedule ${schedule.scheduleid}:`, classesError);
          return {
            id: schedule.scheduleid,
            name: schedule.schedulename,
            semester: schedule.semester,
            year: schedule.year,
            classes: [],
            createdAt: schedule.createdat,
            updatedAt: schedule.lastedited,
          };
        }

        if (!scheduleClasses || scheduleClasses.length === 0) {
          return {
            id: schedule.scheduleid,
            name: schedule.schedulename,
            semester: schedule.semester,
            year: schedule.year,
            classes: [],
            createdAt: schedule.createdat,
            updatedAt: schedule.lastedited,
          };
        }

        // Fetch class details from allclasses table
        const classUuids = scheduleClasses.map((sc: any) => sc.uuid);
        const { data: classDetails, error: detailsError } = await supabase
          .from('allclasses')
          .select('uuid, classid, dept, code, title, days, starttime, endtime, component, instructor, credithours, location, room, availseats')
          .in('uuid', classUuids);

        if (detailsError) {
          console.error(`[getUserSchedules] Error fetching class details:`, detailsError);
          return {
            id: schedule.scheduleid,
            name: schedule.schedulename,
            semester: schedule.semester,
            year: schedule.year,
            classes: [],
            createdAt: schedule.createdat,
            updatedAt: schedule.lastedited,
          };
        }

        // Format classes to match ClassSection type
        const formattedClasses = (classDetails || []).map((cls: any) => ({
          uuid: cls.uuid,
          classID: cls.classid?.toString() || '',
          dept: cls.dept,
          code: cls.code,
          title: cls.title,
          days: cls.days || '',
          starttime: cls.starttime || '',
          endtime: cls.endtime || '',
          component: cls.component || '',
          instructor: cls.instructor,
          seats_available: cls.availseats,
          credithours: cls.credithours,
          location: cls.location,
          room: cls.room,
        }));

        return {
          id: schedule.scheduleid,
          name: schedule.schedulename,
          semester: schedule.semester,
          year: schedule.year,
          classes: formattedClasses,
          createdAt: schedule.createdat,
          updatedAt: schedule.lastedited,
        };
      })
    );

    return Response.json({ schedules: schedulesWithClasses });
  } catch (error) {
    console.error('[getUserSchedules] Unexpected error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/getUserSchedules
 * Alternative method - fetch schedules by user ID in request body
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return Response.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Use the same logic as GET but with userId from body
    // This is useful for server-side calls where auth header isn't available
    
    const { data: userScheduleData, error: userScheduleError } = await supabase
      .from('userschedule')
      .select('scheduleid')
      .eq('auth_user_id', userId)
      .eq('isactive', true);

    if (userScheduleError) {
      console.error('[getUserSchedules POST] Error:', userScheduleError);
      return Response.json({ error: 'Failed to fetch schedules' }, { status: 500 });
    }

    if (!userScheduleData || userScheduleData.length === 0) {
      return Response.json({ schedules: [] });
    }

    const scheduleIds = userScheduleData.map((us: any) => us.scheduleid);

    const { data: schedules, error: schedulesError } = await supabase
      .from('allschedules')
      .select('scheduleid, schedulename, semester, year, createdat, lastedited')
      .in('scheduleid', scheduleIds);

    if (schedulesError) {
      console.error('[getUserSchedules POST] Error fetching schedules:', schedulesError);
      return Response.json({ error: 'Failed to fetch schedule details' }, { status: 500 });
    }

    // Fetch classes for each schedule (same as GET method)
    const schedulesWithClasses = await Promise.all(
      (schedules || []).map(async (schedule: any) => {
        const { data: scheduleClasses } = await supabase
          .from('scheduleclasses')
          .select('uuid')
          .eq('scheduleid', schedule.scheduleid);

        if (!scheduleClasses || scheduleClasses.length === 0) {
          return {
            id: schedule.scheduleid,
            name: schedule.schedulename,
            semester: schedule.semester,
            year: schedule.year,
            classes: [],
            createdAt: schedule.createdat,
            updatedAt: schedule.lastedited,
          };
        }

        const classUuids = scheduleClasses.map((sc: any) => sc.uuid);
        const { data: classDetails } = await supabase
          .from('allclasses')
          .select('uuid, classid, dept, code, title, days, starttime, endtime, component, instructor, credithours, location, room, availseats')
          .in('uuid', classUuids);

        const formattedClasses = (classDetails || []).map((cls: any) => ({
          uuid: cls.uuid,
          classID: cls.classid?.toString() || '',
          dept: cls.dept,
          code: cls.code,
          title: cls.title,
          days: cls.days || '',
          starttime: cls.starttime || '',
          endtime: cls.endtime || '',
          component: cls.component || '',
          instructor: cls.instructor,
          seats_available: cls.availseats,
          credithours: cls.credithours,
          location: cls.location,
          room: cls.room,
        }));

        return {
          id: schedule.scheduleid,
          name: schedule.schedulename,
          semester: schedule.semester,
          year: schedule.year,
          classes: formattedClasses,
          createdAt: schedule.createdat,
          updatedAt: schedule.lastedited,
        };
      })
    );

    return Response.json({ schedules: schedulesWithClasses });
  } catch (error) {
    console.error('[getUserSchedules POST] Unexpected error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
