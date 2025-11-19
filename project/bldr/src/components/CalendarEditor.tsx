"use client";
import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useScheduleBuilder } from "@/contexts/ScheduleBuilderContext";
import { CalendarClassItem } from "@/types";

const CalendarEditor = () => {
  const { draftSchedule, draftScheduleName } = useScheduleBuilder();


  // State and refs for resizing
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  // Mouse event handlers for resizing
  const startResize = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.body.style.cursor = "nwse-resize";
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({
      width: Math.max(300, Math.min(900, e.clientX - rect.left)),   // min 300, max 900
      height: Math.max(200, Math.min(700, e.clientY - rect.top)),   // min 200, max 700
    });
  };

  const stopResize = () => {
    isResizing.current = false;
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8 AM to 8 PM

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center m-5 bg-[#2c2c2c] flex-1 overflow-auto border-2 border-[#404040] rounded-[10px] text-white p-2"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: 900,
        maxHeight: 700,
        minWidth: 300,
        minHeight: 200,
      }}
    >
      <div className="w-full h-full aspect-3/2">
        <AnimatePresence>
          {draftScheduleName || draftSchedule.length > 0 ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-full h-full overflow-auto"
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
                      className="relative h-8 md:h-11 border-t border-[#404040]"
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
                            .filter((cls: CalendarClassItem) => {
                              const classDays = cls.days
                                .split(",")
                                .map((d: string) => d.trim());
                              return (
                                classDays.includes(day) &&
                                cls.startTimeInDecimal >= hour &&
                                cls.startTimeInDecimal < hour + 1
                              );
                            })
                            .map((cls: CalendarClassItem, idx: number) => {
                              const baseRowHeight =
                                window.innerWidth < 500 ? 32 : 44;
                              const offset =
                                (cls.startTimeInDecimal - hour) * baseRowHeight;
                              const height = cls.duration * baseRowHeight;

                              return (
                                <div
                                  key={idx}
                                  className={`${
                                    cls.color || "bg-yellow-300"
                                  } absolute flex flex-col items-start left-0.5 right-0.5 p-0.5 rounded-md text-[#1a1a1a] shadow-md z-10 overflow-hidden`}
                                  style={{
                                    top: `${offset}px`,
                                    height: `${height}px`,
                                  }}
                                >
                                  <div className="font-bold text-[8px] md:text-xs font-dmsans truncate">
                                    {cls.dept} {cls.code}
                                  </div>
                                  <div className="text-[8px] md:text-xs font-figtree truncate">
                                    {cls.instructor}
                                  </div>
                                </div>
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
      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        className="absolute -right-[0.5px] -bottom-[0.5px] w-4 h-4 bg-[#404040] cursor-nwse-resize rounded-br-[10px] z-20"
        style={{ userSelect: "none" }}
        title="Resize"
      />
    </div>
  );
};

export default CalendarEditor;