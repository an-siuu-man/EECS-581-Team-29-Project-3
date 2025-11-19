// Schedule related types
import { CalendarClassItem } from './class';

export interface Schedule {
  id: string;
  name: string;
  semester: string;
  year: string;
  classes: CalendarClassItem[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSchedule {
  onlineid: string;
  scheduleid: string;
  isactive: boolean;
  user_id?: string;
}

export interface CreateScheduleRequest {
  scheduleName: string;
  semester: string;
  year: string;
}

export interface CreateScheduleResponse {
  schedule: any;
  userSchedule: UserSchedule;
}
