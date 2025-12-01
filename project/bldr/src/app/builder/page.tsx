"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useScheduleBuilder } from "@/contexts/ScheduleBuilderContext";
import { useActiveSchedule } from "@/contexts/ActiveScheduleContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LogOut,
  AlertCircle,
  Trash2,
  X,
  Check,
  Save,
  CheckCheck,
} from "lucide-react";
import toastStyle from "@/components/ui/toastStyle";
import ClassSearch from "@/components/ClassSearch";
import { Sidebar } from "@/components/Sidebar";
import CalendarEditor from "@/components/CalendarEditor";
import { Spinner } from "@/components/ui/spinner";

export default function Builder() {
  const { user, session, loading, signOut } = useAuth();
  const {
    clearDraft,
    draftSchedule,
    draftScheduleName,
    draftSemester,
    draftYear,
    existingScheduleId,
    setIsEditingExisting,
    setExistingScheduleId,
  } = useScheduleBuilder();
  const {
    activeSchedule,
    addScheduleToList,
    updateScheduleInList,
    fetchUserSchedules,
  } = useActiveSchedule();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [creditHours, setCreditHours] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // Helper to compare schedules regardless of order
  const areSchedulesEqual = (a: any[] | undefined, b: any[] | undefined) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    const uuidsA = new Set(a.map((cls: any) => cls.uuid));
    const uuidsB = new Set(b.map((cls: any) => cls.uuid));
    if (uuidsA.size !== uuidsB.size) return false;
    for (const uuid of uuidsA) {
      if (!uuidsB.has(uuid)) return false;
    }
    return true;
  };

  const schedulesMatch = areSchedulesEqual(
    activeSchedule?.classes,
    draftSchedule
  );

  // Hydration check - ensures localStorage data is loaded
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Calculate credit hours after hydration and when draftSchedule changes
  useEffect(() => {
    if (!isHydrated) return;

    if (draftSchedule.length > 0) {
      const totalCreditHours = draftSchedule
        .filter(
          (cls: any) => cls.component === "LEC" || cls.component === "LAB"
        )
        .map((cls: any) => Number(cls.credithours) || 0)
        .reduce((a: number, b: number) => a + b, 0);
      setCreditHours(totalCreditHours);
    } else {
      setCreditHours(0);
    }
  }, [draftSchedule, isHydrated]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully", {
        style: { ...toastStyle },
        duration: 2000,
        icon: <LogOut className="h-5 w-5" />,
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout", {
        style: { ...toastStyle },
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5" />,
      });
    }
  };

  const handleSaveSchedule = async () => {
    if (!session?.access_token) {
      toast.error("You must be logged in to save schedules", {
        style: { ...toastStyle },
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5" />,
      });
      return;
    }

    if (!draftScheduleName || !draftSemester || !draftYear) {
      toast.error("Please fill in schedule name, semester, and year", {
        style: { ...toastStyle },
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5" />,
      });
      return;
    }

    // if (draftSchedule.length === 0) {
    //   toast.error("Cannot save an empty schedule", {
    //     style: { ...toastStyle },
    //     duration: 3000,
    //     icon: <AlertCircle className="h-5 w-5" />,
    //   });
    //   return;
    // }

    setIsSaving(true);

    try {
      const response = await fetch("/api/saveSchedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          scheduleId: existingScheduleId,
          name: draftScheduleName,
          semester: draftSemester,
          year: draftYear,
          classes: draftSchedule,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save schedule");
      }

      // Update context with saved schedule
      const savedSchedule = {
        id: data.scheduleId,
        name: draftScheduleName,
        semester: draftSemester,
        year: draftYear,
        classes: draftSchedule,
        isActive: true,
      };

      if (existingScheduleId) {
        // Update existing schedule
        updateScheduleInList(existingScheduleId, savedSchedule);
        toast.success("Schedule updated successfully!", {
          style: { ...toastStyle },
          duration: 3000,
          icon: <Check className="h-5 w-5 text-green-500" />,
        });
      } else {
        // Add new schedule
        addScheduleToList(savedSchedule);
        setIsEditingExisting(true);
        setExistingScheduleId(data.scheduleId);
        toast.success("Schedule saved successfully!", {
          style: { ...toastStyle },
          duration: 3000,
          icon: <Check className="h-5 w-5 text-green-500" />,
        });
      }

      // Refresh the schedule list
      await fetchUserSchedules();
    } catch (error: any) {
      console.error("Save schedule error:", error);
      toast.error(error.message || "Failed to save schedule", {
        style: { ...toastStyle },
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5" />,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSchedule = () => {
    toast(
      <div className="flex flex-col gap-2">
        <p className="font-inter text-white">
          Clear all classes from schedule?
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              clearDraft();
              toast.dismiss();
              toast.success("Schedule cleared", {
                style: { ...toastStyle },
                duration: 2000,
                icon: <Trash2 className="h-5 w-5" />,
              });
            }}
            className="font-dmsans cursor-pointer"
          >
            <Check className="h-4 w-4 mr-1" />
            Confirm
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toast.dismiss()}
            className="font-dmsans cursor-pointer"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>,
      {
        style: { ...toastStyle },
        duration: Infinity,
        icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-dmsans mb-2">Loading...</h2>
          <p className="text-[#A8A8A8] font-inter">Please wait</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#080808]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-figtree font-semibold mb-2">
                <span className="font-dmsans font-bold">
                  <span className="text-white">b</span>
                  <span className="text-red-500">l</span>
                  <span className="text-blue-600">d</span>
                  <span className="text-yellow-300">r</span>
                </span>{" "}
                Schedule Builder
              </h1>
              <p className="text-[#A8A8A8] font-inter">
                Welcome back, {user.email}!
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="font-dmsans cursor-pointer"
            >
              Logout
            </Button>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-[3fr_7fr] gap-6">
            {/* Class Search Section */}
            <div className="flex justify-center items-start">
              <ClassSearch />
            </div>

            {/* Calendar Section */}
            <div className="flex flex-col items-end">
              <CalendarEditor />
              <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <div className="text-sm flex flex-wrap gap-2 items-center text-[#A8A8A8] font-inter">
                  <motion.div
                    layout
                    initial={false}
                    transition={{ layout: { duration: 0.22, ease: "easeOut" } }}
                    className="bg-white text-gray-950 rounded-full py-1 px-3 inline-flex items-center"
                  >
                    <span className="md:whitespace-nowrap">
                      Total Credit Hours:
                    </span>
                    <b className="ml-1">{creditHours}</b>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {schedulesMatch && (
                      <motion.div
                        key="saved-badge"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.22 }}
                        className="bg-green-800 text-green-300 rounded-full py-1 px-3"
                      >
                        Saved schedule
                      </motion.div>
                    )}

                    {!schedulesMatch && (
                      <motion.div
                        key="unsaved-badge"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.22 }}
                        className="rounded-full py-1 px-2 text-yellow-300 bg-yellow-800"
                      >
                        Unsaved changes
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto md:justify-end">
                  <Button
                    onClick={handleSaveSchedule}
                    className="font-dmsans cursor-pointer w-full md:w-auto max-w-[600px]"
                    disabled={isSaving || schedulesMatch}
                  >
                    {isSaving ? (
                      <>
                        <Spinner />
                        Saving...
                      </>
                    ) : (
                      <>
                        {!schedulesMatch ? (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Schedule
                          </>
                        ) : (
                          <>
                            <CheckCheck className="text-green-600" />
                            Synced
                          </>
                        )}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleClearSchedule}
                    variant="destructive"
                    className="font-dmsans cursor-pointer w-full md:w-auto max-w-[600px]"
                    disabled={draftSchedule.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
