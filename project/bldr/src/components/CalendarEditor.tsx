"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useScheduleBuilder } from "@/contexts/ScheduleBuilderContext";
import { ClassSection } from "@/types";
import { timeToDecimal, calculateDuration, parseDays } from "@/lib/timeUtils";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const CalendarEditor = () => {
  const { draftSchedule, draftScheduleName } = useScheduleBuilder();

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8 AM to 8 PM

  return (
    <div
      className="relative flex justify-center items-center my-5 bg-[#2c2c2c] border-2 border-[#404040] rounded-[10px] text-white px-2 w-full"
      style={{ height: '600px' }}
    >
      <div className="w-full h-full overflow-hidden">
        <AnimatePresence>
          {draftScheduleName || draftSchedule.length > 0 ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-full h-full"
            >
              <table className="table-fixed h-full w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-center font-semibold font-figtree h-10 w-10 md:w-[50px] text-xs md:text-sm">
                      Time
                    </th>
                    {days.map((day) => (
                      <th
                        key={day}
                        className="text-center font-semibold font-figtree p-1 md:p-2 text-xs md:text-sm"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hours.map((hour) => (
                    <tr
                      key={hour}
                      className="relative h-7 border-t border-[#404040]"
                    >
                      <td className="align-top pr-1 md:pr-2 text-[9px] md:text-xs text-right font-figtree">
                        {hour}:00
                      </td>
                      {days.map((day) => (
                        <td
                          key={day}
                          className="relative align-top w-20 md:w-[150px]"
                        >
                          <div className="absolute top-[50%] translate-y-[-50%] w-full border-t border-dashed border-[#424242] z-0" />

                          {draftSchedule
                            .filter((cls: ClassSection) => {
                              const classDays = parseDays(cls.days || '');
                              const startTime = timeToDecimal(cls.starttime || '');
                              return (
                                classDays.includes(day) &&
                                startTime >= hour &&
                                startTime < hour + 1
                              );
                            })
                            .map((cls: ClassSection, idx: number) => {
                              const baseRowHeight = 38;
                              const startTime = timeToDecimal(cls.starttime || '');
                              const duration = calculateDuration(cls.starttime || '', cls.endtime || '');
                              const offset = (startTime - hour) * baseRowHeight;
                              const height = duration * baseRowHeight;

                              // Generate a color based on dept
                              const colors = [
                                'bg-yellow-300',
                                'bg-blue-300',
                                'bg-green-300',
                                'bg-pink-300',
                                'bg-purple-300',
                                'bg-red-300',
                              ];
                              const colorIndex = (cls.dept?.charCodeAt(0) || 0) % colors.length;

                              return (
                                <TooltipProvider key={idx}>
                                  <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={`${
                                          colors[colorIndex]
                                        } absolute flex flex-col items-start justify-center left-0.5 right-0.5 p-1 rounded-md text-[#1a1a1a] shadow-md z-10 overflow-hidden cursor-pointer`}
                                        style={{
                                          top: `${offset}px`,
                                          height: `${height}px`,
                                        }}
                                      >
                                        <div className="font-bold text-xs font-dmsans truncate w-full">
                                          {cls.dept} {cls.code} ({cls.component})
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="font-figtree" side="top">
                                     <p>{cls.dept} {cls.code} ({cls.component})</p>
                                      <p>{cls.instructor || 'Staff'}</p>
                                      <p className="flex"><p className="mr-4">#{cls.classID }</p><p>{cls.days}</p></p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <div className="font-inter m-2 text-center text-xs md:text-sm">
              Create a new schedule or choose one of your previous ones to see it here!
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarEditor;