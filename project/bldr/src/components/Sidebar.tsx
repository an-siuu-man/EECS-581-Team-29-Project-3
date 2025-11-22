"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

export function Sidebar() {
  const { user } = useAuth();
  const {
    activeSchedule,
    setActiveSchedule,
    activeSemester,
    setActiveSemester,
    userSchedules,
    loadSchedule,
    addScheduleToList,
  } = useActiveSchedule();

  const [open, setOpen] = useState(true);
  const [newScheduleName, setNewScheduleName] = useState("");

  const toggleSidebar = () => {
    setOpen(!open);
  };

  // // Fetch schedules from API
  // useEffect(() => {
  //   const fetchSchedules = async () => {
  //     try {
  //       const response = await fetch('http://10.104.175.40:5000/api/schedule/load', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ userID: userId }),
  //       });

  //       const data = await response.json();
  //       console.log("Fetched schedules:", data);
  //       setSchedules(data.schedules); // assuming API returns { schedules: [...] }
  //     } catch (error) {
  //       console.error("Error loading schedules:", error);
  //     }
  //   };

  //   if (userId) {
  //     fetchSchedules();
  //   }
  // }, [userId]);

  // const handleScheduleClick = async (scheduleName) => {
  //   try {
  //     // First API call: create the schedule
  //     const res = await fetch('http://10.104.175.40:5000/api/schedule/create', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ userID: userId, semester: 'Fall 2025' }),
  //     });

  //     if (!res.ok) {
  //       throw new Error('Failed to create schedule');
  //     }

  //     const data = await res.json();
  //     console.log("Created schedule:", data);

  //     // Second API call: rename the created schedule
  //     const renameRes = await fetch('http://10.104.175.40:5000/api/schedule/rename', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         schedID: data.schedID,
  //         newName: scheduleName,
  //       }),
  //     });

  //     if (!renameRes.ok) {
  //       throw new Error('Failed to rename schedule');
  //     }

  //     const renameData = await renameRes.json();
  //     console.log("Renamed schedule:", renameData);

  //   } catch (error) {
  //     console.error("Error during schedule creation/rename:", error);
  //   }
  // };

  return (
    <div
      className={`${
        open ? "mr-[360px]" : "mr-[90px]"
      } z-100 transition-all duration-300`}
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
            <svg
              viewBox="0 0 24 24"
              height={34}
              width={34}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`cursor-pointer p-1 rounded-md transition duration-500 ${
                open ? "" : "rotate-180"
              }`}
              onClick={toggleSidebar}
            >
              <path
                d="M21.97 15V9C21.97 4 19.97 2 14.97 2H8.96997C3.96997 2 1.96997 4 1.96997 9V15C1.96997 20 3.96997 22 8.96997 22H14.97C19.97 22 21.97 20 21.97 15Z"
                stroke="#fafafa"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M7.96997 2V22"
                stroke="#fafafa"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M14.97 9.43994L12.41 11.9999L14.97 14.5599"
                stroke="#fafafa"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>

            {open && (
              <motion.div
                className="cursor-pointer transition-all duration-300"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <svg
                        viewBox="0 0 24 24"
                        height={34}
                        width={34}
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="cursor-pointer hover:bg-[#404040] p-1 rounded-md transition duration-300"
                      >
                        <path
                          d="M11.5 19C15.6421 19 19 15.6421 19 11.5C19 7.35786 15.6421 4 11.5 4C7.35786 4 4 7.35786 4 11.5C4 15.6421 7.35786 19 11.5 19Z"
                          stroke="#fafafa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M20.9999 20.9999L16.6499 16.6499"
                          stroke="#fafafa"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent
                      className="text-xs font-figtree z-100 text-[#fafafa]"
                      side="bottom"
                    >
                      <p>Search schedule</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            )}
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
                          onClick={() => {
                            if (newScheduleName.trim()) {
                              // TODO: Implement schedule creation API call
                              // For now, just add to local list
                              // handleScheduleClick(newScheduleName.trim());
                              const newSchedule = {
                                id: Date.now().toString(),
                                name: newScheduleName.trim(),
                                semester: activeSemester || "Fall 2025",
                                year: 2025,
                                classes: [],
                              };
                              addScheduleToList(newSchedule);
                              setNewScheduleName("");
                            }
                          }}
                          className="bg-[#fafafa] text-xs text-[#1a1a1a] hover:bg-[#404040] hover:text-[#fafafa] cursor-pointer font-dmsans text-md"
                        >
                          Create
                        </Button>
                      </div>

                      {/* Schedule list */}
                      <ul className="list-none pl-2">
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
                            .map((schedule: any, index: number) => (
                              <li
                                key={index}
                                className={`text-sm text-[#fafafa] font-inter my-2 hover:bg-[#333] rounded-md transition duration-75 ${
                                  activeSchedule?.id === schedule.id
                                    ? "bg-[#333]"
                                    : ""
                                }`}
                              >
                                <button
                                  className="p-2 cursor-pointer w-full text-left"
                                  onClick={() => {
                                    loadSchedule(schedule.id);
                                    setActiveSemester(schedule.semester);
                                    console.log(activeSchedule);
                                  }}
                                >
                                  {schedule.name}
                                </button>
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
