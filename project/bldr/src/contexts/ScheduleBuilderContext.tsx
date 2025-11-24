"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { timeToDecimal } from "@/lib/timeUtils";
import { parseDays } from "@/lib/timeUtils";
import { toast } from "sonner";
import { AlertTriangle, AlertCircle, Check, Repeat } from "lucide-react";

const ScheduleBuilderContext = createContext<any>(undefined);

export const ScheduleBuilderProvider = ({ children }: any) => {
  // Helper to sync state with localStorage
  const usePersistedState = (key: string, initialValue: any) => {
    const [state, setState] = useState(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initialValue;
      }
      return initialValue;
    });

    useEffect(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(state));
      }
    }, [key, state]);

    return [state, setState];
  };

  // Draft schedule data (unsaved)
  const [draftSchedule, setDraftSchedule] = usePersistedState(
    "draftSchedule",
    []
  );
  const [draftScheduleName, setDraftScheduleName] = usePersistedState(
    "draftScheduleName",
    ""
  );
  const [draftSemester, setDraftSemester] = usePersistedState(
    "draftSemester",
    ""
  );
  const [draftYear, setDraftYear] = usePersistedState("draftYear", "");

  // Track if editing existing schedule
  const [isEditingExisting, setIsEditingExisting] = usePersistedState(
    "isEditingExisting",
    false
  );
  const [existingScheduleId, setExistingScheduleId] = usePersistedState(
    "existingScheduleId",
    null
  );

  // Helper functions
  const checkTimeConflict = (newClass: any, existingClasses: any[]) => {
    const newDays = parseDays(newClass.days);
    const newStart = timeToDecimal(newClass.starttime);
    const newEnd = timeToDecimal(newClass.endtime);

    for (const existing of existingClasses) {
      // Skip conflict check if it's the same class (dept, code, component) - we'll replace it anyway
      if (
        existing.dept === newClass.dept &&
        existing.code === newClass.code &&
        existing.component === newClass.component
      ) {
        continue;
      }

      const existingDays = parseDays(existing.days);
      const existingStart = timeToDecimal(existing.starttime);
      const existingEnd = timeToDecimal(existing.endtime);

      // Check if there's any day overlap
      const hasCommonDay = newDays.some((day: string) =>
        existingDays.includes(day)
      );

      if (hasCommonDay) {
        // Check if times overlap: new class starts before existing ends AND new class ends after existing starts
        const timeOverlap = newStart < existingEnd && newEnd > existingStart;

        if (timeOverlap) {
          console.log(
            `Checking conflict between ${newClass.dept} ${newClass.code} ${newClass.classID} and ${existing.dept} ${existing.code} ${existing.classID}`
          );
          console.log(`Conflict detected I am existing.!!!!!!!!!!!`);
          // console.log(`newItem: ${newClass.dept} ${newClass.code} ${newClass.classID}`);
          // console.log(`existingItem: ${existing.dept} ${existing.code} ${existing.classID}`);
          return {
            conflict: true,
            conflictingClass: existing,
          };
        }
      }
    }

    return { conflict: false };
  };

  const addClassToDraft = (classItem: any) => {
    // Check conditions before state update
    const exists = draftSchedule.some(
      (item: any) => item.uuid === classItem.uuid
    );
    if (exists) {
      // Show toast notification for duplicate
      toast.error(
        `Section #${classItem.classID} of ${classItem.dept} ${classItem.code} (${classItem.component}) is already in the schedule`,
        {
          style: {
            fontFamily: "Inter",
            backgroundColor: "#404040",
            color: "#fff",
          },
          duration: 3000,
          icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
        }
      );
      return; // Don't add duplicate UUID
    }

    const sameComponentExists = draftSchedule.some(
      (item: any) =>
        item.dept === classItem.dept &&
        item.code === classItem.code &&
        item.component === classItem.component
    );

    const alreadyExists = draftSchedule.some(
      (item: any) => item.classID === classItem.classID
    );

    const conflictCheck = checkTimeConflict(classItem, draftSchedule);
    if (conflictCheck.conflict) {
      // Show toast notification for conflict
      const conflicting = conflictCheck.conflictingClass;
      toast.error(
        `Time conflict with ${conflicting.dept} ${conflicting.code} (${conflicting.component})`,
        {
          style: {
            fontFamily: "Inter",
            backgroundColor: "#404040",
            color: "#fff",
          },
          duration: 3000,
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        }
      );
      return;
    }

    if (sameComponentExists) {
      // Find the old class being replaced for the toast notification
      const oldClass = draftSchedule.find(
        (item: any) =>
          item.dept === classItem.dept &&
          item.code === classItem.code &&
          item.component === classItem.component
      );

      // Show toast notification for replacement
      toast.success(
        `Replaced ${oldClass.component} #${oldClass.classID} with #${classItem.classID}`,
        {
          style: {
            fontFamily: "Inter",
            backgroundColor: "#404040",
            color: "#fff",
          },
          duration: 3000,
          icon: <Repeat className="h-5 w-5 text-blue-500" />,
        }
      );

      // Replace the existing section of this component type
      setDraftSchedule((prev: any) =>
        prev.map((item: any) =>
          item.dept === classItem.dept &&
          item.code === classItem.code &&
          item.component === classItem.component
            ? classItem
            : item
        )
      );
      return;
    }

    // Show toast notification for new class addition
    toast.success(
      `Added ${classItem.dept} ${classItem.code} (${classItem.component}) #${classItem.classID} to schedule`,
      {
        style: {
          fontFamily: "Inter",
          backgroundColor: "#404040",
          color: "#fff",
        },
        duration: 3000,
        icon: <Check className="h-5 w-5 text-green-500" />,
      }
    );

    // Add new class section
    setDraftSchedule((prev: any) => [...prev, classItem]);
  };

  const removeClassFromDraft = (index: number) => {
    setDraftSchedule((prev: any) =>
      prev.filter((_: any, i: number) => i !== index)
    );
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
