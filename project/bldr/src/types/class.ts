// Class and Section related types

export interface ClassSection {
  uuid: string;
  classID: string;
  days: string;
  starttime: string;
  endtime: string;
  component: string;
  instructor?: string;
  seats_available: number;
}

export interface ClassData {
  dept: string;
  code: string;
  title: string;
  description?: string;
  sections: ClassSection[];
}

export interface ClassInfoResponse {
  data: ClassData[];
}

export interface ClassProps {
  uuid: string;
  dept: string;
  classcode: string;
}

// Selected/Searched class types
export interface SelectedClass {
  classID: string;
  className: string;
  dept: string;
  code: string;
  startTime: string;
  endTime: string;
  days: string;
  instructor?: string;
}

export interface SearchedClass {
  uuid: string;
  code?: string;
  title?: string;
  dept?: string;
  credithours?: number;
  instructor?: string;
  days?: string;
}

// Calendar/Schedule class item
export interface CalendarClassItem {
  days: string;
  startTimeInDecimal: number;
  duration: number;
  color?: string;
  dept: string;
  code: string;
  instructor: string;
  section?: string;
  credits?: number;
}
