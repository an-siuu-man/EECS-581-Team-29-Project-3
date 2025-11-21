'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { timeToDecimal } from "@/lib/timeUtils";
import { parseDays } from "@/lib/timeUtils";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

const ScheduleBuilderContext = createContext<any>(undefined);

export const ScheduleBuilderProvider = ({ children }: any) => {
  // Helper to sync state with localStorage
  const usePersistedState = (key: string, initialValue: any) => {
    const [state, setState] = useState(() => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initialValue;
      }
      return initialValue;
    });

    useEffect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(state));
      }
    }, [key, state]);

    return [state, setState];
  };

  // Draft schedule data (unsaved)
  const [draftSchedule, setDraftSchedule] = usePersistedState("draftSchedule", []);
  const [draftScheduleName, setDraftScheduleName] = usePersistedState("draftScheduleName", "");
  const [draftSemester, setDraftSemester] = usePersistedState("draftSemester", "");
  const [draftYear, setDraftYear] = usePersistedState("draftYear", "");
  
  // Track if editing existing schedule
  const [isEditingExisting, setIsEditingExisting] = usePersistedState("isEditingExisting", false);
  const [existingScheduleId, setExistingScheduleId] = usePersistedState("existingScheduleId", null);

  // Helper functions
  const checkTimeConflict = (newClass: any, existingClasses: any[]) => {
    const newDays = parseDays(newClass.days);
    const newStart = timeToDecimal(newClass.starttime);
    const newEnd = timeToDecimal(newClass.endtime);

    for (const existing of existingClasses) {
      const existingDays = parseDays(existing.days);
      const existingStart = timeToDecimal(existing.starttime);
      const existingEnd = timeToDecimal(existing.endtime);

      // Check if there's any day overlap
      const hasCommonDay = newDays.some((day: string) => existingDays.includes(day));
      
      if (hasCommonDay) {
        // Check if times overlap: new class starts before existing ends AND new class ends after existing starts
        const timeOverlap = newStart < existingEnd && newEnd > existingStart;
        
        if (timeOverlap) {
          console.log(`Checking conflict between ${newClass.dept} ${newClass.code} ${newClass.classID} and ${existing.dept} ${existing.code} ${existing.classID}`);
          console.log(`Conflict detected I am existing.!!!!!!!!!!!`);
          // console.log(`newItem: ${newClass.dept} ${newClass.code} ${newClass.classID}`);
          // console.log(`existingItem: ${existing.dept} ${existing.code} ${existing.classID}`);
          return {
            conflict: true,
            conflictingClass: existing
          };
        }
      }
    }

    return { conflict: false };
  };

  const addClassToDraft = (classItem: any) => {
    setDraftSchedule((prev: any) => {
      // Check if class with this UUID already exists
      const exists = prev.some((item: any) => item.uuid === classItem.uuid);
      if (exists) {
        return prev; // Don't add duplicate UUID
      }
            // Check if a section of the same class (classID) and same component type already exists
      const sameComponentExists = prev.some((item: any) => 
        item.dept === classItem.dept &&
        item.code === classItem.code &&
        item.component === classItem.component
      );

      const conflictCheck = checkTimeConflict(classItem, prev);
      if (conflictCheck.conflict) {
        // Show toast notification for conflict
        const conflicting = conflictCheck.conflictingClass;
        toast.error(
          `Time conflict with ${conflicting.dept} ${conflicting.code} (${conflicting.component})`,
          {
            style: { fontFamily: 'Inter', backgroundColor: '#404040', color: '#fff' },
            duration: 3000,
            icon: <AlertTriangle className="h-5 w-5" />,
          }
        );
        return prev;
      }
      
      if (sameComponentExists) {
        // Check if replacement would cause conflicts with other classes
        const otherClasses = prev.filter((item: any) => 
          !(item.dept === classItem.dept &&
            item.code === classItem.code &&
            item.component === classItem.component)
        );

        
        // const replacementConflict = checkTimeConflict(classItem, otherClasses);
        // if (replacementConflict.conflict) {
        //   const conflicting = replacementConflict.conflictingClass;
        //   console.log(`Conflict detected when replacing with ${classItem.dept} ${classItem.code} ${classItem.classID}`);
        //   toast.error(
        //     `Time conflict with ${conflicting.dept} ${conflicting.code} (${conflicting.component})`,
        //     {
        //       style: { fontFamily: 'Inter', backgroundColor: '#404040', color: '#fff' },
        //       duration: 3000,
        //       icon: <AlertTriangle className="h-5 w-5 text-yellow-300" />,
        //     }
        //   );
        //   return prev;
        // }
        
        // Replace the existing section of this component type
        return prev.map((item: any) => 
          item.dept === classItem.dept &&
          item.code === classItem.code &&
          item.component === classItem.component
            ? classItem
            : item
        );
      }
      
      prev.data.map((item: any) =>
        console.log(`Existing item in draft: ${item.dept} ${item.code} ${item.classID}`)
      );
      // Add new class section
      return [...prev, classItem];
    });
  };

  const removeClassFromDraft = (index: number) => {
    setDraftSchedule((prev: any) => prev.filter((_: any, i: number) => i !== index));
  };

  const clearDraft = () => {
    setDraftSchedule([]);
    setDraftScheduleName("");
    setDraftSemester("");
    setDraftYear("");
    setIsEditingExisting(false);
    setExistingScheduleId(null);
  };

  const loadExistingScheduleIntoDraft = (schedule: any) => {
    setDraftSchedule(schedule.classes || []);
    setDraftScheduleName(schedule.name || "");
    setDraftSemester(schedule.semester || "");
    setDraftYear(schedule.year || "");
    setIsEditingExisting(true);
    setExistingScheduleId(schedule.id || null);
  };

  return (
    <ScheduleBuilderContext.Provider
      value={{
        draftSchedule,
        setDraftSchedule,
        draftScheduleName,
        setDraftScheduleName,
        draftSemester,
        setDraftSemester,
        draftYear,
        setDraftYear,
        isEditingExisting,
        setIsEditingExisting,
        existingScheduleId,
        setExistingScheduleId,
        addClassToDraft,
        removeClassFromDraft,
        clearDraft,
        loadExistingScheduleIntoDraft,
      }}
    >
      {children}
    </ScheduleBuilderContext.Provider>
  );
};

export const useScheduleBuilder = () => {
  return useContext(ScheduleBuilderContext);
};
