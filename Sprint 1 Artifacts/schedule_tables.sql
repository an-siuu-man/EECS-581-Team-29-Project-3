-- to be run after supabase_init.sql

------------------------------------------------------------
-- Schedule ↔ Class join  (scheduleclasses)
------------------------------------------------------------
create table if not exists scheduleclasses (
    uuid        uuid primary key default gen_random_uuid(),
    scheduleid  uuid not null references allschedules(scheduleid) on delete cascade,
    classid     int4 not null references allclasses(classid)      on delete cascade,
    unique (scheduleid, classid)
);

create index if not exists idx_schedclasses_sched on scheduleclasses(scheduleid);

------------------------------------------------------------
-- User ↔ Schedule ownership  (userschedule)
------------------------------------------------------------
create table if not exists userschedule (
    userscheduleid uuid primary key default gen_random_uuid(),
    onlineid       text not null references userdata(onlineid)     on delete cascade,
    scheduleid     uuid not null references allschedules(scheduleid) on delete cascade,
    isactive       boolean not null default false,
    unique (onlineid, scheduleid)
);

create index if not exists idx_userschedule_active
  on userschedule(onlineid)
  where isactive = true;
