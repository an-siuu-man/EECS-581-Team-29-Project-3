import { supabase } from '../../lib/supabaseClient';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { scheduleid, classid, uuid } = body;
        if (!scheduleid || !classid || !uuid) {
            return Response.json({ error: 'Missing scheduleid, classid, or uuid' }, { status: 400 });
        }
        // Insert class into the database
        const { data, error } = await supabase
            .from('scheduleclasses')
            .insert({scheduleid, classid, uuid})
            .select()
            .single();
        if (error) {
            console.error('Error inserting class:', error);
            return Response.json({ error: 'Failed to add class' }, { status: 500 });
        }
        // Return success response
        return Response.json({ 
            success: true, 
            message: 'Class added successfully',
            class: data
        }, { status: 200 });
    }
    catch (err: any) {
        console.error('Add class error:', err);
        return Response.json({ error: 'Server error', details: err.message }, { status: 500 });
    }
}