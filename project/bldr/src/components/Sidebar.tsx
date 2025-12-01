"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Variants } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveSchedule } from "@/contexts/ActiveScheduleContext";
import { useScheduleBuilder } from "@/contexts/ScheduleBuilderContext";
import { toast } from "sonner";
import {
  Sidebar as SidebarIcon,
  Trash2,
  AlertCircle,
  MoreHorizontal,
  Edit2,
  Check,
  X,
  User,
  Sparkles,
  UserPlus,
} from "lucide-react";
import toastStyle from "@/components/ui/toastStyle";
import { set } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { se } from "date-fns/locale";
import { Spinner } from "./ui/spinner";
import Link from "next/link";

export function Sidebar() {
  const { user, session } = useAuth();
  const {
    activeSchedule,
    setActiveSchedule,
    activeSemester,
    setActiveSemester,
    userSchedules,
    loadSchedule,
    addScheduleToList,
    updateScheduleInList,
    removeScheduleFromList,
  } = useActiveSchedule();

  const { clearDraft, draftSchedule, draftScheduleName, setDraftScheduleName } =
    useScheduleBuilder();
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");
  const [hoveredScheduleId, setHoveredScheduleId] = useState<string | null>(
    null
  );
  const [renamingScheduleId, setRenamingScheduleId] = useState<string | null>(
    null
  );
  const [renameValue, setRenameValue] = useState("");

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const handleCreateSchedule = async (newScheduleName: string) => {
    setLoading(true);
    const scheduleName = newScheduleName.trim() || "Untitled";
    try {
      const response = await fetch("/api/createSchedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduleName: scheduleName,
          semester: activeSemester || "Spring 2026",
          year: 2026,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create schedule");
      }

      const data = await response.json();

      // Add the new schedule to the local list
      const newSchedule = {
        id: data.schedule.scheduleid,
        name: data.schedule.schedulename,
        semester: data.schedule.semester,
        year: data.schedule.year,
        classes: [],
      };
      addScheduleToList(newSchedule);
      setNewScheduleName("");
      setLoading(false);
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error("Failed to create schedule", {
        style: toastStyle,
        duration: 2000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
    }
  };

  const handleRenameSchedule = async (scheduleId: string, newName: string) => {
    if (!newName.trim()) {
      toast.error("Schedule name cannot be empty", {
        style: toastStyle,
        duration: 2000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    if (!session?.access_token) {
      toast.error("You must be logged in to rename schedules", {
        style: toastStyle,
      });
      return;
    }

    try {
      const res = await fetch("/api/renameSchedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ scheduleId, newName: newName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to rename schedule");
      }

      setDraftScheduleName(newName.trim());
      // Update the local schedule list with the new name
      const scheduleToUpdate = userSchedules.find(
        (s: any) => s.id === scheduleId
      );
      if (scheduleToUpdate) {
        updateScheduleInList(scheduleId, {
          ...scheduleToUpdate,
          name: newName.trim(),
        });
      }

      toast.success("Schedule renamed successfully", {
        style: toastStyle,
        duration: 2000,
      });
    } catch (err: any) {
      console.error("Error renaming schedule:", err);
      toast.error(err?.message || "Failed to rename schedule", {
        style: toastStyle,
      });
    } finally {
      setRenamingScheduleId(null);
      setRenameValue("");
    }
  };

  const startRenaming = (schedule: any) => {
    setRenamingScheduleId(schedule.id);
    setRenameValue(schedule.name);
  };

  const cancelRenaming = () => {
    setRenamingScheduleId(null);
    setRenameValue("");
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!session?.access_token) {
      toast.error("You must be logged in to delete schedules", {
        style: toastStyle,
      });
      return;
    }

    // Show a toast confirmation UI instead of browser confirm
    const performDelete = async () => {
      try {
        const res = await fetch("/api/deleteSchedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ scheduleId }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to delete schedule");
        }

        // Remove from local context
        removeScheduleFromList(scheduleId);
        setActiveSchedule(null);
        setActiveSemester("");
        clearDraft();
        toast.success("Schedule deleted", {
          duration: 2000,
          style: toastStyle,
        });
      } catch (err: any) {
        console.error("Error deleting schedule:", err);
        toast.error(err?.message || "Failed to delete schedule", {
          style: toastStyle,
        });
      }
    };

    const id = toast(
      <div className="flex flex-col gap-2">
        <p className="font-inter text-white">
          Delete this schedule? This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              toast.dismiss(id);
              await performDelete();
            }}
            className="font-dmsans"
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toast.dismiss(id)}
            className="font-dmsans"
          >
            Cancel
          </Button>
        </div>
      </div>,
      {
        duration: Infinity,
        icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      }
    );
  };

  // Framer-motion variants removed for sidebar list (using plain list now)

  return (
    <div
      className={`${
        open ? "mr-[360px]" : "mr-[90px]"
      } z-45 transition-all duration-300`}
    >
      <div
        className={`sidebar mr-2 flex flex-col justify-between rounded-tr-2xl rounded-br-2xl fixed top-0 left-0 h-screen transition-all duration-300 ${
          open
            ? "min-w-[350px] max-w-[350px] bg-[#1a1a1a]"
            : "bg-transparent min-w-20 max-w-20"
        } overflow-hidden p-5`}
      >
        {/* Top section: toggle & search */}
        <div>
          <div className="buttons-container flex items-center justify-between mb-5">
            <SidebarIcon
              size={34}
              className={`cursor-pointer p-1 rounded-md transition duration-500 ${
                open ? "" : "rotate-180"
              }`}
              onClick={toggleSidebar}
            />
          </div>

          {/* Main Sidebar Content */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <h1 className="text-2xl font-bold text-gray-300 mb-4 font-figtree">
                  Your Schedules
                </h1>

                <Accordion
                  type="single"
                  collapsible
                  defaultValue="spring-2026"
                  className="font-figtree"
                >
                  <AccordionItem value="spring-2026">
                    <AccordionTrigger className="text-lg  text-green-400 hover:no-underline hover:cursor-pointer font-bold">
                      Spring 2026
                    </AccordionTrigger>
                    <AccordionContent className="font-inter">
                      {/* New schedule input */}
                      <Label
                        htmlFor="schedule-name"
                        className="text-sm font-dmsans mb-1 text-[#888888]"
                      >
                        Make new schedule
                      </Label>
                      <div className="flex flex-row items-center justify-between gap-2 mb-4">
                        <Input
                          type="text"
                          id="schedule-name"
                          value={newScheduleName}
                          onChange={(e) => setNewScheduleName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleCreateSchedule(newScheduleName);
                            }
                          }}
                          placeholder="Schedule name"
                          className="font-inter border-[#404040] border placeholder:text-xs selection:bg-blue-400 text-xs"
                        />
                        <Button
                          type="submit"
                          disabled={loading}
                          onClick={() => {
                            handleCreateSchedule(newScheduleName);
                          }}
                          className="bg-[#fafafa] text-xs text-[#1a1a1a] hover:bg-[#404040] hover:text-[#fafafa] cursor-pointer font-dmsans text-md"
                        >
                          {loading ? (
                            <>
                              <Spinner /> Creating...
                            </>
                          ) : (
                            "Create"
                          )}
                        </Button>
                      </div>

                      {/* Schedule list */}
                      <ul className="list-none overflow-y-scroll overflow-x-hidden scrollbar-hidden max-h-[300px]">
                        {userSchedules.length === 0 ? (
                          <p className="text-sm text-gray-400">
                            No schedules found.
                          </p>
                        ) : (
                          <AnimatePresence initial={false}>
                            {userSchedules
                              .filter(
                                (schedule: any) =>
                                  schedule.semester === activeSemester ||
                                  activeSemester === ""
                              )
                              .map((schedule: any) => (
                                <motion.li
                                  key={schedule.id}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  transition={{
                                    duration: 0.15,
                                    ease: [0.4, 0, 0.2, 1],
                                  }}
                                  onMouseEnter={() =>
                                    setHoveredScheduleId(schedule.id)
                                  }
                                  onMouseLeave={() =>
                                    setHoveredScheduleId(null)
                                  }
                                  className={`flex justify-between items-center text-sm text-[#fafafa] font-inter my-2 rounded-md ${
                                    activeSchedule?.id === schedule.id
                                      ? "bg-[#555] font-bold"
                                      : "hover:bg-[#333]"
                                  }`}
                                >
                                  {renamingScheduleId === schedule.id ? (
                                    <div className="flex items-center gap-2 w-full px-2 py-1">
                                      <Input
                                        type="text"
                                        value={renameValue}
                                        onChange={(e) =>
                                          setRenameValue(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleRenameSchedule(
                                              schedule.id,
                                              renameValue
                                            );
                                          } else if (e.key === "Escape") {
                                            cancelRenaming();
                                          }
                                        }}
                                        autoFocus
                                        className="h-7 text-xs border-[#404040] bg-[#2a2a2a] flex-1"
                                      />
                                      <button
                                        onClick={() =>
                                          handleRenameSchedule(
                                            schedule.id,
                                            renameValue
                                          )
                                        }
                                        className="p-1 hover:bg-[#444] rounded transition cursor-pointer"
                                      >
                                        <Check className="h-4 w-4 text-green-500" />
                                      </button>
                                      <button
                                        onClick={cancelRenaming}
                                        className="p-1 hover:bg-[#444] rounded transition cursor-pointer"
                                      >
                                        <X className="h-4 w-4 text-red-500" />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        className="py-2 px-3 cursor-pointer w-full text-left truncate"
                                        onClick={() => {
                                          loadSchedule(schedule.id);
                                          setActiveSemester(schedule.semester);
                                          console.log(activeSchedule);
                                        }}
                                      >
                                        {schedule.name}
                                      </button>
                                      {hoveredScheduleId === schedule.id && (
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <button className="flex items-center z-50 cursor-pointer">
                                              <MoreHorizontal className="h-4 w-4 mr-2" />
                                            </button>
                                          </PopoverTrigger>
                                          <PopoverContent className="bg-[#2a2a2a] border rounded-md border-[#404040] p-2 w-fit">
                                            <div className="flex flex-col items-start justify-between gap-1 text-sm">
                                              <span
                                                className="p-2 rounded-md w-full flex flex-row items-center justify-start gap-2 font-inter cursor-pointer hover:bg-[#444] transition"
                                                onClick={() =>
                                                  startRenaming(schedule)
                                                }
                                              >
                                                <Edit2 className="h-4 w-4" />
                                                Rename
                                              </span>
                                              <hr className="w-full border-t border-[#606060]" />
                                              <span
                                                className="p-2 rounded-md w-full flex flex-row items-center justify-start gap-2 font-inter cursor-pointer hover:bg-[#444] transition text-red-500"
                                                onClick={() =>
                                                  handleDeleteSchedule(
                                                    schedule.id
                                                  )
                                                }
                                              >
                                                <Trash2 className="h-4 w-4 " />
                                                Delete
                                              </span>
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                      )}
                                    </>
                                  )}
                                </motion.li>
                              ))}
                          </AnimatePresence>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col w-full gap-3">
          {/* Upgrade button for guest users */}
          <AnimatePresence>
            {open && user?.is_anonymous && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Link href="/upgrade">
                  <Button
                    variant="outline"
                    className="w-full cursor-pointer font-dmsans border-yellow-600/50 text-yellow-400 hover:bg-yellow-900/30 hover:text-yellow-300"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User info */}
          <div className="flex flex-row w-full items-center justify-start gap-2">
            <User />
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, translateY: 40 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: 40 }}
                  key={user?.email || "guest"}
                  className="font-figtree text-md"
                >
                  {user?.is_anonymous ? "Guest" : user?.email}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
