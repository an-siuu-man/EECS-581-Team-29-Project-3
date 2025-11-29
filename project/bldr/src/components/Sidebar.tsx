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
import { toast } from "sonner";
import { Sidebar as SidebarIcon, Trash2, AlertCircle } from "lucide-react";

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
    removeScheduleFromList,
  } = useActiveSchedule();

  const [open, setOpen] = useState(true);
  const [newScheduleName, setNewScheduleName] = useState("");

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!session?.access_token) {
      toast.error("You must be logged in to delete schedules");
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

        toast.success("Schedule deleted", { duration: 2000 });
      } catch (err: any) {
        console.error("Error deleting schedule:", err);
        toast.error(err?.message || "Failed to delete schedule");
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
        style: {
          fontFamily: "Inter",
          backgroundColor: "#404040",
          color: "#fff",
        },
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
                  defaultValue="fall-2025"
                  className="font-figtree"
                >
                  <AccordionItem value="fall-2025">
                    <AccordionTrigger className="text-lg  text-green-400 hover:no-underline hover:cursor-pointer font-bold">
                      Fall 2025
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
                          placeholder="Schedule name"
                          className="font-inter border-[#404040] border placeholder:text-xs selection:bg-blue-400 text-xs"
                        />
                        <Button
                          type="button"
                          onClick={async () => {
                            if (newScheduleName.trim()) {
                              try {
                                const response = await fetch(
                                  "/api/createSchedule",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      scheduleName: newScheduleName.trim(),
                                      semester: activeSemester || "Fall",
                                      year: 2025,
                                    }),
                                  }
                                );

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
                              } catch (error) {
                                console.error(
                                  "Error creating schedule:",
                                  error
                                );
                                // You might want to show an error message to the user here
                              }
                            }
                          }}
                          className="bg-[#fafafa] text-xs text-[#1a1a1a] hover:bg-[#404040] hover:text-[#fafafa] cursor-pointer font-dmsans text-md"
                        >
                          Create
                        </Button>
                      </div>

                      {/* Schedule list */}
                      <ul className="list-none overflow-scroll max-h-[300px] shadow-inner">
                        {userSchedules.length === 0 ? (
                          <p className="text-sm text-gray-400">
                            No schedules found.
                          </p>
                        ) : (
                          userSchedules
                            .filter(
                              (schedule: any) =>
                                schedule.semester === activeSemester ||
                                activeSemester === ""
                            )
                            .map((schedule: any) => (
                              <li
                                key={schedule.id}
                                className={`flex justify-between items-center text-sm text-[#fafafa] font-inter my-2 rounded-md transition-all duration-75 ${
                                  activeSchedule?.id === schedule.id
                                    ? "bg-[#555] font-bold"
                                    : "hover:bg-[#333]"
                                }`}
                              >
                                <button
                                  className="py-2 px-3 cursor-pointer w-full text-left"
                                  onClick={() => {
                                    loadSchedule(schedule.id);
                                    setActiveSemester(schedule.semester);
                                    console.log(activeSchedule);
                                  }}
                                >
                                  {schedule.name}
                                </button>
                                {activeSchedule?.id === schedule.id && (
                                  <button className="relative z-50 cursor-pointer">
                                    <TooltipProvider key={schedule.id}>
                                      <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                          <span
                                            onClick={() =>
                                              handleDeleteSchedule(schedule.id)
                                            }
                                          >
                                            <Trash2 className="h-6 w-6 rounded-full p-1 hover:bg-gray-700 transition text-red-500 mr-2" />
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          sideOffset={-3}
                                          className="font-inter"
                                        >
                                          Delete Schedule
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </button>
                                )}
                              </li>
                            ))
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
        <div className="flex flex-row w-full items-center justify-start gap-2">
          <svg
            viewBox="0 0 24 24"
            height={30}
            width={30}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.14 21.62C17.26 21.88 16.22 22 15 22H8.99998C7.77998 22 6.73999 21.88 5.85999 21.62C6.07999 19.02 8.74998 16.97 12 16.97C15.25 16.97 17.92 19.02 18.14 21.62Z"
              stroke="#fafafa"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M15 2H9C4 2 2 4 2 9V15C2 18.78 3.14 20.85 5.86 21.62C6.08 19.02 8.75 16.97 12 16.97C15.25 16.97 17.92 19.02 18.14 21.62C20.86 20.85 22 18.78 22 15V9C22 4 20 2 15 2ZM12 14.17C10.02 14.17 8.42 12.56 8.42 10.58C8.42 8.60002 10.02 7 12 7C13.98 7 15.58 8.60002 15.58 10.58C15.58 12.56 13.98 14.17 12 14.17Z"
              stroke="#fafafa"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, translateY: 40 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 40 }}
                key={user?.email}
                className="font-figtree text-md"
              >
                {user?.email}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
