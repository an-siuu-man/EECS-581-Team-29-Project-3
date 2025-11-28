"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Schedule } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface ActiveScheduleContextType {
  // Active schedule being viewed/edited (could be saved or unsaved)
  activeSchedule: Schedule | null;
  setActiveSchedule: (schedule: Schedule | null) => void;

  // Active semester filter
  activeSemester: string;
  setActiveSemester: (semester: string) => void;

  // All user schedules
  userSchedules: Schedule[];
  setUserSchedules: (schedules: Schedule[]) => void;

  // Helper functions
  loadSchedule: (scheduleId: string) => void;
  clearActiveSchedule: () => void;
  addScheduleToList: (schedule: Schedule) => void;
  updateScheduleInList: (scheduleId: string, updatedSchedule: Schedule) => void;
  removeScheduleFromList: (scheduleId: string) => void;

  // Fetch user schedules from database
  fetchUserSchedules: () => Promise<void>;
}

const ActiveScheduleContext = createContext<
  ActiveScheduleContextType | undefined
>(undefined);

export const ActiveScheduleProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, session, loading } = useAuth();
  // Helper to sync state with localStorage
  const usePersistedState = <T,>(key: string, initialValue: T) => {
    const [state, setState] = useState<T>(() => {
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

    return [state, setState] as const;
  };

  // Active schedule being viewed/edited
  const [activeSchedule, setActiveSchedule] =
    usePersistedState<Schedule | null>("activeSchedule", null);

  // Active semester filter
  const [activeSemester, setActiveSemester] = usePersistedState<string>(
    "activeSemester",
    ""
  );

  // All user schedules
  const [userSchedules, setUserSchedules] = usePersistedState<Schedule[]>(
    "userSchedules",
    []
  );

  // Load a specific schedule by ID
  const loadSchedule = (scheduleId: string) => {
    const schedule = userSchedules.find((s) => s.id === scheduleId);
    if (schedule) {
      setActiveSchedule(schedule);
    }
  };

  // Clear the active schedule
  const clearActiveSchedule = () => {
    setActiveSchedule(null);
  };

  // Add a new schedule to the list
  const addScheduleToList = (schedule: Schedule) => {
    setUserSchedules((prev) => [schedule, ...prev]);
    setActiveSchedule(schedule);
    console.log("Added new schedule:", schedule);
  };

  // Update an existing schedule in the list
  const updateScheduleInList = (
    scheduleId: string,
    updatedSchedule: Schedule
  ) => {
    setUserSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? updatedSchedule : s))
    );

    // If this is the active schedule, update it too
    if (activeSchedule?.id === scheduleId) {
      setActiveSchedule(updatedSchedule);
    }
  };

  // Remove a schedule from the list
  const removeScheduleFromList = (scheduleId: string) => {
    setUserSchedules((prev) => prev.filter((s) => s.id !== scheduleId));

    // If this was the active schedule, clear it
    if (activeSchedule?.id === scheduleId) {
      setActiveSchedule(null);
    }
  };

  // Fetch user schedules from database using Supabase user ID
  const fetchUserSchedules = async () => {
    if (!user?.id || !session?.access_token) {
      console.log("No user logged in or no access token");
      return;
    }

    try {
      const response = await fetch("/api/getUserSchedules", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }

      const data = await response.json();
      console.log("Fetched user schedules:", data.schedules);
      setUserSchedules(data.schedules || []);
    } catch (error) {
      console.error("Error fetching user schedules:", error);
      setUserSchedules([]);
    }
  };

  // Fetch schedules when user changes. Respect auth `loading` so we don't
  // clear persisted state while the auth library is still initializing
  // (this prevents wiping `activeSchedule` on page refresh).
  useEffect(() => {
    if (loading) return; // wait until auth has finished initializing

    if (user?.id) {
      fetchUserSchedules();
    } else {
      setUserSchedules([]);
      setActiveSchedule(null);
    }
  }, [user?.id, loading]);

  return (
    <ActiveScheduleContext.Provider
      value={{
        activeSchedule,
        setActiveSchedule,
        activeSemester,
        setActiveSemester,
        userSchedules,
        setUserSchedules,
        loadSchedule,
        clearActiveSchedule,
        addScheduleToList,
        updateScheduleInList,
        removeScheduleFromList,
        fetchUserSchedules,
      }}
    >
      {children}
    </ActiveScheduleContext.Provider>
  );
};

export const useActiveSchedule = () => {
  const context = useContext(ActiveScheduleContext);
  if (context === undefined) {
    throw new Error(
      "useActiveSchedule must be used within an ActiveScheduleProvider"
    );
  }
  return context;
};
