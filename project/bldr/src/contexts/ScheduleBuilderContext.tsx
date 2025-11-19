'use client';

import { createContext, useContext, useEffect, useState } from "react";

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
  const addClassToDraft = (classItem: any) => {
    setDraftSchedule((prev: any) => [...prev, classItem]);
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
