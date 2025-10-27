-- Enable UUID generation once per database
create extension if not exists "pgcrypto";

------------------------------------------------------------
-- 1. Course catalogue  (allclasses)
------------------------------------------------------------
create table if not exists allclasses (
    uuid         uuid        primary key default gen_random_uuid(),
    classid      int4        unique,                -- stable numeric ID
    dept         varchar(16) not null,
    code         varchar(16) not null,
    title        text        not null,
    credithours  float8      check (credithours > 0),
    availseats   int4        default 0,
    component    varchar(32),
    instructor   text,
    starttime    varchar(8),    -- '09:00'
    endtime      varchar(8),    -- '09:50'
    location     text,
    days         varchar(8),    -- 'MWF'
    room         varchar(32)
);

create index if not exists idx_allclasses_dept_code on allclasses(dept, code);

------------------------------------------------------------
-- 2. Schedule metadata  (allschedules)
------------------------------------------------------------
create table if not exists allschedules (
    scheduleid  uuid        primary key default gen_random_uuid(),
    schedulename text       not null,
    semester    varchar(16) not null,
    year        int4        not null check (year >= 2000),
    createdat   timestamptz not null default now(),
    lastedited  timestamptz not null default now()
);

------------------------------------------------------------
-- 3. User profiles  (userdata)
------------------------------------------------------------
create table if not exists userdata (
    onlineid   text        primary key,              -- Supabase auth.uid()
    passhash   text        not null,
    signdate   timestamptz not null default now(),
    isactive   boolean     not null default true
);
