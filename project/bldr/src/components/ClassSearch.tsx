"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFloating, offset, flip, shift, size, autoUpdate, FloatingPortal } from "@floating-ui/react";
import { Input } from "./ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { SearchedClass } from "@/types";
import { Trash2, Search } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
import Class from "./Class";
import NewClass from "@/components/NewClass";
import { useScheduleBuilder } from "@/contexts/ScheduleBuilderContext";
export default function ClassSearch() {
  // Get schedule builder context
  const { draftSchedule, removeClassFromDraft } = useScheduleBuilder();

  // Fallback local state (was previously coming from a context like useAuth)
  const [selectedClasses, setSelectedClasses] = useState<SearchedClass[]>([]);

  const [classes, setClasses] = useState<SearchedClass[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPosStyle, setDropdownPosStyle] = useState<React.CSSProperties | undefined>(undefined);

  // Floating UI setup
  const { x, y, strategy, refs, update, middlewareData } = useFloating({
    placement: "bottom-start",
    middleware: [
      offset(6),
      flip(),
      shift({ padding: 8 }),
      size({
        apply({ rects, availableWidth, availableHeight, elements }) {
          // match the reference width and clamp to availableWidth
          const width = Math.min(rects.reference.width, availableWidth - 8);
          Object.assign(elements.floating.style, {
            width: `${width}px`,
            maxHeight: `${Math.min(320, availableHeight * 0.6)}px`,
          });
        },
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });
  

  useEffect(() => {
    const delay = setTimeout(() => {
      if (!searchQuery.trim()) {
        setClasses([]);
        return;
      }
      fetch("/api/searchclass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      })
        .then((r) => r.json())
        .then((d) => {
          setClasses(d || []);
          setHighlightedIndex(0); // Reset highlight when new results come in
        })
        .catch(() => setClasses([]));
    }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Attach floating refs when wrapper is available and update position when open
  useEffect(() => {
    refs.setReference(wrapperRef.current);
  }, [refs]);

  useEffect(() => {
    // update floating position when dropdown opens or class list changes
    if (dropdownOpen) update?.();
  }, [dropdownOpen, classes.length, update]);

  

  function handleDropdownSelect(uuid: string) {
    const isAlreadyPresent = selectedClasses.some((cls) => cls.uuid === uuid);
    if (isAlreadyPresent) {
      setSelectedClasses((prevClasses) =>
        prevClasses.filter((item) => item.uuid !== uuid)
      );
      console.log(selectedClasses);
    } else {
      const newClass = classes.find((c) => c.uuid === uuid);
      if (newClass) {
        setSelectedClasses((prevClasses) => [
          {
            uuid: newClass.uuid,
            code: newClass.code,
            title: newClass.title,
            dept: newClass.dept,
            credithours: newClass.credithours,
            instructor: newClass.instructor,
            days: newClass.days,
          },
          ...prevClasses,
        ]);
        console.log(selectedClasses);
      }
    }
  }

  return (
    <div className="flex flex-col justify-start items-center my-5 min-w-[420px] max-w-[500px] max-h-[600px] overflow-y-scroll scrollbar-hidden bg-[#080808] transition-all duration-150 border-2 border-[#303030] rounded-[10px]">
      <div className="flex flex-col justify-start items-center w-full h-full p-5">
        <h1 className="text-xl self-start font-figtree font-bold text-[#fafafa]">
          Search for classes
        </h1>
        <div className="flex-col justify-start items-center w-full">
          <div
            ref={wrapperRef}
            className="class-search-form flex flex-row justify-start items-center gap-2 w-full mt-5"
            tabIndex={-1}
            onFocus={() => setDropdownOpen(true)}
            onBlur={(e) => {
              // Only close if focus moves outside the dropdown/input
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setDropdownOpen(false);
              }
            }}
          >
            <Input
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              onKeyDown={(e) => {
                if (!dropdownOpen || classes.length === 0) return;

                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightedIndex((prev) =>
                    prev < classes.length - 1 ? prev + 1 : prev
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (classes[highlightedIndex]) {
                    handleDropdownSelect(classes[highlightedIndex].uuid);
                    setDropdownOpen(false);
                  }
                }
              }}
              placeholder="Class name"
              className="font-inter border-[#404040] border placeholder:text-xs selection:bg-blue-400 text-xs"
            />
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button className="cursor-pointer hover:bg-[#404040] p-1 rounded-md transition duration-300">
                    <Search className="h-6 w-6 text-[#fafafa]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="font-figtree" side="bottom">
                  <p>Search class</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <FloatingPortal>
            {classes.length > 0 && dropdownOpen && (
              <ul
                ref={(el) => refs.setFloating(el)}
                key="dropdown"
                className="rounded shadow bg-[#232323] overflow-y-auto mt-2"
                style={{ position: strategy, left: x ?? 0, top: y ?? 0 }}
                tabIndex={-1}
                role="listbox"
                aria-label="Search results"
              >
                <AnimatePresence mode="popLayout">
                  {classes.map((c, index) => (
                    <motion.li
                      key={c.uuid}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onMouseDown={async (e) => {
                        e.preventDefault();
                        await handleDropdownSelect(c.uuid);
                        setDropdownOpen(false);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      role="option"
                      aria-selected={index === highlightedIndex}
                      className={`p-2 text-sm text-[#fafafa] hover:cursor-pointer scroll-p-4 font-inter last:border-b-0 ${
                        index === highlightedIndex
                          ? "bg-[#181818]"
                          : "hover:bg-[#181818]"
                      }`}
                    >
                      <strong>
                        {c.dept} {c.code}
                      </strong>{" "}
                      - {c.title}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </FloatingPortal>
        </div>

        <div className="w-full max-w-full mt-4">
          <Accordion
            type="multiple"
            defaultValue={["item-1", "item-2"]}
            className="font-figtree"
          >
            {/* Searched Section */}
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg text-green-400 font-bold hover:no-underline hover:cursor-pointer">
                <div className="flex items-center justify-between gap-2 w-full">
                  <span>Searched</span>
                  {selectedClasses.length > 0 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClasses([]);
                        setSearchQuery("");
                      }}
                      className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer transition-colors font-inter font-normal"
                    >
                      Clear all searched
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="font-inter max-h-[300px] overflow-y-scroll scrollbar-hidden">
                {selectedClasses.length === 0 ? (
                  <div className="text-sm text-[#888888] font-figtree">
                    No classes searched
                  </div>
                ) : (
                  selectedClasses.map((c) => (
                    <div key={c.uuid} className="relative group">
                      <Class
                        uuid={c.uuid}
                        classcode={c.code || ""}
                        dept={c.dept || ""}
                      />
                      <button
                        onClick={() =>
                          setSelectedClasses((prev) =>
                            prev.filter((cls) => cls.uuid !== c.uuid)
                          )
                        }
                        className="absolute top-3 right-3 cursor-pointer rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#080808]/80 hover:bg-[#181818]"
                        title="Remove from searched"
                      >
                        {<Trash2 className="h-4 w-4 text-red-500" />}
                      </button>
                    </div>
                  ))
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Currently Added Section */}
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg text-purple-400 font-bold hover:no-underline hover:cursor-pointer">
                Currently Selected
              </AccordionTrigger>
              <AccordionContent className="font-inter max-h-[300px] overflow-y-scroll scrollbar-hidden">
                {draftSchedule.length === 0 ? (
                  <div className="text-sm text-[#888888] font-figtree">
                    No classes added
                  </div>
                ) : (
                  (() => {
                    // Group sections by class (dept + code)
                    const groupedClasses = draftSchedule.reduce(
                      (acc: any, section: any, index: number) => {
                        const key = `${section.dept}-${section.code}`;
                        if (!acc[key]) {
                          acc[key] = {
                            dept: section.dept,
                            code: section.code,
                            title: section.title,
                            sections: [],
                          };
                        }
                        acc[key].sections.push({
                          ...section,
                          originalIndex: index,
                        });
                        return acc;
                      },
                      {}
                    );

                    return Object.values(groupedClasses).map(
                      (classGroup: any) => (
                        <div
                          key={`${classGroup.dept}-${classGroup.code}`}
                          className="bg-[#181818] rounded-lg p-3 mb-2 border border-[#303030]"
                        >
                          <div className="font-bold text-white mb-4">
                            {classGroup.dept} {classGroup.code}:{" "}
                            {classGroup.title}
                          </div>
                          <div className="flex flex-col gap-2">
                            {classGroup.sections.map((section: any) => (
                              <div
                                key={section.originalIndex}
                                className="relative group bg-[#101010] rounded p-2 border border-[#404040]"
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="text-sm font-semibold text-purple-400">
                                    {section.component} ({section.classID})
                                  </div>
                                  <div className="text-xs text-[#888888]">
                                    {section.days} • {section.starttime} -{" "}
                                    {section.endtime}
                                  </div>
                                  {section.instructor && (
                                    <div className="text-xs text-[#888888]">
                                      {section.instructor}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() =>
                                    removeClassFromDraft(section.originalIndex)
                                  }
                                  className="absolute top-1 right-1 cursor-pointer rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  title="Remove section"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    );
                  })()
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
