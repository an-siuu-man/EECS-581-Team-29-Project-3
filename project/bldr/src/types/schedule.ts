// Schedule related types
// Matches the 'allschedules', 'scheduleclasses', and 'userschedule' tables
import { CalendarClassItem, ClassSection } from "./class";

/**
 * Represents a schedule record from the allschedules table
 */
export interface AllSchedulesRecord {
  scheduleid: string; // uuid (PK)
  schedulename: string; // text (NOT NULL)
  semester: string; // character varying (NOT NULL)
  year: number; // integer (NOT NULL, > 1900)
  createdat?: Date | string; // timestamp (default CURRENT_TIMESTAMP)
  lastedited?: Date | string; // timestamp (default CURRENT_TIMESTAMP)
}

/**
 * Represents a schedule-class relationship from the scheduleclasses table
 */
export interface ScheduleClassesRecord {
  scheduleid: string; // uuid (FK to allschedules)
  classid: number; // integer (NOT NULL)
  uuid: string; // uuid (FK to allclasses)
}

/**
 * Represents a user-schedule relationship from the userschedule table
 * Updated to use Supabase auth UUID
 */
export interface UserScheduleRecord {
  userscheduleid: string; // uuid (PK)
  auth_user_id: string; // uuid (FK to auth.users) - Supabase user ID
  scheduleid: string; // uuid (FK to allschedules)
  isactive: boolean; // boolean (default true)
}

/**
 * Schedule object used in the frontend
 */
export interface Schedule {
  id: string; // Maps to scheduleid
  name: string; // Maps to schedulename
  semester: string;
  year: number | string; // Can be number from DB or string in UI
  classes: ClassSection[]; // List of class sections in this schedule
  isActive?: boolean; // Maps to isactive from userschedule
  createdAt?: Date | string; // Maps to createdat
  updatedAt?: Date | string; // Maps to lastedited
}

/**
 * Legacy UserSchedule interface (keeping for backward compatibility)
 */
export interface UserSchedule {
  userscheduleid?: string;
  onlineid: string;
  scheduleid: string;
  isactive: boolean;
  user_id?: string; // Deprecated field
}

/**
 * Request body for creating a new schedule
 */
export interface CreateScheduleRequest {
  scheduleName: string;
  semester: string;
  year: number | string;
}

/**
 * Response from createSchedule API
 */
export interface CreateScheduleResponse {
  schedule: AllSchedulesRecord;
  userSchedule: UserScheduleRecord;
}
