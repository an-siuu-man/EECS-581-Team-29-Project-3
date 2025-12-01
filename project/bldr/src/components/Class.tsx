"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Loader from "@/components/Loader";
import {
  ClassProps,
  ClassSection,
  ClassData,
  ClassInfoResponse,
} from "@/types";
import { useScheduleBuilder } from "@/contexts/ScheduleBuilderContext";
import { timeToDecimal, calculateDuration } from "@/lib/timeUtils";
export default function Class(props: ClassProps) {
  const { addClassToDraft } = useScheduleBuilder();
  const [selectedClasses, setSelectedClasses] = useState<any>({});
  const [classInfo, setClassInfo] = useState<ClassInfoResponse>({ data: [] });

  const handleSectionClick = async (
    section: ClassSection,
    classData: ClassData
  ) => {
    // Convert section to ClassSection format for calendar
    const classToAdd: ClassSection = {
      ...section,
      dept: classData.dept,
      code: classData.code,
      title: classData.title,
    };

    await addClassToDraft(classToAdd);

    // Call parent handler if provided
    if (props.onSectionClick) {
      props.onSectionClick(section, classData);
    }
  };

  const callAPI = async (dept: string, code: string) => {
    const r = await fetch(`/api/getClassInfo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: `${dept} ${code}`,
        term: "4262",
        fetchRemote: true,
      }),
    });
    const d = await r.json();
    setClassInfo(d);
  };

  useEffect(() => {
    callAPI(props.dept, props.classcode);
  }, []);

  useEffect(() => {
    if (classInfo) {
      console.log(classInfo);
    }
  }, [classInfo]);

  return (
    <AnimatePresence>
      {classInfo && classInfo.data.length > 0 ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: { delay: 0.3 },
          }}
          exit={{ scale: 0.6, opacity: 0 }}
          key={props.uuid}
          className="flex flex-col p-2 mt-2 mb-6 rounded-md text-[#fafafa] border-2 max-w-[420px] border-[#404040] shadow-md justify-start items-center"
        >
          <h1 className="font-dmsans text-lg font-bold self-start">
            {classInfo.data[0].dept} {classInfo.data[0].code}:{" "}
            {classInfo.data[0].title}
          </h1>
          <p className="text-sm text-[#b0b0b0] font-inter self-start">
            {classInfo.data[0].description || "No description available."}
          </p>
          {classInfo.data[0].sections.map((section: ClassSection) => (
            <button
              disabled={(section.seats_available ?? 0) <= 0}
              key={section.uuid}
              onClick={() => handleSectionClick(section, classInfo.data[0])}
              className={
                `w-full font-inter rounded-md mt-2 bg-[#181818] transition duration-100 px-3  text-left` +
                ((section.seats_available ?? 0) > 0
                  ? " cursor-pointer hover:bg-[#232323]"
                  : " cursor-default opacity-60")
              }
            >
              <div className="flex flex-row w-full justify-between gap-4 items-start my-1">
                <div className="flex flex-row gap-4 items-start">
                  <div className="flex flex-col">
                    <span className="font-semibold">#{section.classID}</span>
                    <span className="text-xs text-[#a8a8a8] self-center">
                      {section.component}
                    </span>
                  </div>
                  <div className="flex flex-col justify-start items-start font-inter">
                    <span className="text-sm text-[#fafafa]">
                      {section.days}{" "}
                      {section.starttime && section.endtime
                        ? `${section.starttime} - ${section.endtime}`
                        : section.starttime || section.endtime || ""}
                    </span>
                    {section.instructor ? (
                      <span className="text-xs text-[#a8a8a8]">
                        {section.instructor}
                      </span>
                    ) : (
                      <span className="text-xs text-[#a8a8a8]">
                        Instructor TBA
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold justify-self-end ${
                    (section.seats_available ?? 0) <= 0
                      ? "text-gray-500"
                      : (section.seats_available ?? 0) <= 3
                      ? "text-red-400"
                      : (section.seats_available ?? 0) < 10
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {section.seats_available}
                </span>
              </div>
            </button>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="flex w-full justify-center items-center mb-6 "
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Loader />
          <p className="mx-2 text-xs font-inter text-[#b0b0b0]">
            Loading details for {props.dept} {props.classcode}...
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
