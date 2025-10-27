-- Seed three courses
insert into allclasses (classid, dept, code, title, credithours, availseats,
                        component, instructor, starttime, endtime, location, days, room)
values
 (101, 'EECS', '168', 'Programming I', 4, 120,
  'LEC', 'John Gibbons', '09:00', '09:50', 'LEEP2 Hall', 'MWF', '1001'),
 (102, 'EECS', '268', 'Programming II', 4, 80,
  'LEC', 'John Gibbons',  '10:00', '10:50', 'LEEP2 Hall', 'MWF', '1411'),
 (103, 'MATH', '125', 'Calculus I',    5, 150,
  'LEC', 'Tori Hudgins',  '11:00', '11:50', 'Budig Hall',  'MWF', '110');

-- Create a demo schedule
insert into allschedules (schedulename, semester, year)
values ('Fall Starter Plan', 'Fall', 2025)
returning scheduleid \gset   -- stores scheduleid in :scheduleid

-- Add two EECS classes to that schedule
insert into scheduleclasses (scheduleid, classid)
select :'scheduleid', classid
from   allclasses
where  classid in (101, 102);

-- Add demo user + ownership
insert into userdata (onlineid, passhash)
values ('demo_uid_123', 'sample_hash');

insert into userschedule (onlineid, scheduleid, isactive)
values ('demo_uid_123', :'scheduleid', true);

-- Quick verification query
select sched.schedulename,
       json_agg(ac.dept || ac.code order by ac.code) as classes
from   allschedules sched
join   scheduleclasses sc on sc.scheduleid = sched.scheduleid
join   allclasses ac      on ac.classid = sc.classid
group  by sched.scheduleid;
