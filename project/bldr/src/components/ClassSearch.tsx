'use client';

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "./ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SearchedClass } from "@/types";
import { Trash2 } from "lucide-react";
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
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    useEffect(() => {
        const delay = setTimeout(() => {
        if (!searchQuery.trim()) {
            setClasses([]);
            return;
        }
        fetch('/api/searchclass', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchQuery }),
        })
            .then(r => r.json())
            .then(d => setClasses(d || []))
            .catch(() => setClasses([]));
        }, 400);
        return () => clearTimeout(delay);
    }, [searchQuery]);


    function handleDropdownSelect(uuid: string) {
        const isAlreadyPresent = selectedClasses.some(cls => cls.uuid === uuid);
        if (isAlreadyPresent) {
            setSelectedClasses(prevClasses => 
            prevClasses.filter(item => item.uuid !== uuid)
            );
            console.log(selectedClasses);
        } else {
            const newClass = classes.find(c => c.uuid === uuid);
            if (newClass) {
                setSelectedClasses(prevClasses => [
    {
                    uuid: newClass.uuid,
                    code: newClass.code,
                    title: newClass.title,
                    dept: newClass.dept,
                    credithours: newClass.credithours,
                    instructor: newClass.instructor,
                    days: newClass.days
                },
                ...prevClasses
                ]);
                console.log(selectedClasses);
            }
        }
    }

    return (
        <div className="flex flex-col justify-start items-center my-5 min-w-[420px] max-w-[500px] max-h-[600px] overflow-y-scroll bg-[#080808] transition-all duration-150 border-2 border-[#303030] rounded-[10px]">
            <div className="flex flex-col justify-start items-center w-full h-full p-5">
                <h1 className="text-xl self-start font-figtree font-bold text-[#fafafa]">Search for classes</h1>
                <div className="flex-col justify-start items-center w-full">
                    <div
                        className="class-search-form flex flex-row justify-start items-center gap-2 w-full mt-5"
                        tabIndex={-1}
                        onFocus={() => setDropdownOpen(true)}
                        onBlur={e => {
                            // Only close if focus moves outside the dropdown/input
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                setDropdownOpen(false);
                            }
                        }}
                    >
                        <Input
                            onChange = {(e) => {setSearchQuery(e.target.value);  setDropdownOpen(true);}}
                            onFocus={() => setDropdownOpen(true)}
                            placeholder="Class name"
                            className="font-inter border-[#404040] border placeholder:text-xs selection:bg-blue-400 text-xs" />
                        <TooltipProvider>
                            <Tooltip delayDuration={300} >
                            <TooltipTrigger asChild >
                                <svg viewBox="0 0 24 24" height={34} width={34} fill="none" xmlns="http://www.w3.org/2000/svg"
                                    className="cursor-pointer hover:bg-[#404040] p-1 rounded-md transition duration-300">
                                    <path d="M11.5 19C15.6421 19 19 15.6421 19 11.5C19 7.35786 15.6421 4 11.5 4C7.35786 4 4 7.35786 4 11.5C4 15.6421 7.35786 19 11.5 19Z" stroke="#fafafa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M20.9999 20.9999L16.6499 16.6499" stroke="#fafafa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </TooltipTrigger>
                            <TooltipContent  className="text-xs bg-accent font-figtree text-[#fafafa]" side='bottom' >
                                <p>Search class</p>
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    </div>
                    
                        <AnimatePresence mode="popLayout">
                            {classes.length > 0 && dropdownOpen && (
                            <motion.ul
                                key="dropdown"
                                className="rounded shadow max-h-64 w-96 fixed z-100 bg-[#232323] overflow-y-auto mt-2"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                tabIndex={-1}
                            >
                                {classes.map(c => (
                                    <motion.li
                                        key={c.uuid}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        onMouseDown={async (e) => {e.preventDefault(); await handleDropdownSelect(c.uuid); setDropdownOpen(false);}}
                                        className="p-2 text-sm text-[#fafafa] hover:bg-[#181818] hover:cursor-pointer scroll-p-4 font-inter last:border-b-0"
                                    >
                                        <strong>{c.dept} {c.code}</strong> - {c.title}
                                    </motion.li>
                                ))}
                            </motion.ul>
                            )}
                        </AnimatePresence>
                    
                </div>

                <div className="w-full max-w-full mt-4">
                    <Accordion type="multiple" defaultValue={["item-1", "item-2"]} className="font-figtree">
                        {/* Searched Section */}
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-lg text-green-400 font-bold hover:no-underline hover:cursor-pointer">Searched</AccordionTrigger>
                            <AccordionContent className="font-inter max-h-[300px] overflow-y-auto">
                                {selectedClasses.length === 0 ? (
                                    <div className="text-sm text-[#888888] font-figtree">No classes searched</div>
                                ) : (
                                    selectedClasses.map(c => (
                                        <Class
                                            key={c.uuid}
                                            uuid={c.uuid}
                                            classcode={c.code || ''}
                                            dept={c.dept || ''}
                                        />
                                    ))
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        {/* Currently Added Section */}
                        <AccordionItem value="item-2" >
                            <AccordionTrigger className="text-lg text-purple-400 font-bold hover:no-underline hover:cursor-pointer">Currently Selected</AccordionTrigger>
                            <AccordionContent className="font-inter max-h-[300px] overflow-y-auto">
                                {draftSchedule.length === 0 ? (
                                    <div className="text-sm text-[#888888] font-figtree">No classes added</div>
                                ) : (
                                    (() => {
                                        // Group sections by class (dept + code)
                                        const groupedClasses = draftSchedule.reduce((acc: any, section: any, index: number) => {
                                            const key = `${section.dept}-${section.code}`;
                                            if (!acc[key]) {
                                                acc[key] = {
                                                    dept: section.dept,
                                                    code: section.code,
                                                    title: section.title,
                                                    sections: []
                                                };
                                            }
                                            acc[key].sections.push({ ...section, originalIndex: index });
                                            return acc;
                                        }, {});

                                        return Object.values(groupedClasses).map((classGroup: any) => (
                                            <div key={`${classGroup.dept}-${classGroup.code}`} className="bg-[#181818] rounded-lg p-3 mb-2 border border-[#303030]">
                                                <div className="font-bold text-white mb-2">
                                                    {classGroup.dept} {classGroup.code}                                                </div>
                                                <div className="text-sm text-[#A8A8A8] mb-2">
                                                    {classGroup.title}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {classGroup.sections.map((section: any) => (
                                                        <div key={section.originalIndex} className="relative group bg-[#101010] rounded p-2 border border-[#404040]">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="text-sm font-semibold text-purple-400">
                                                                    {section.component} ({section.classID})
                                                                </div>
                                                                <div className="text-xs text-[#888888]">
                                                                    {section.days} • {section.starttime} - {section.endtime}
                                                                </div>
                                                                {section.instructor && (
                                                                    <div className="text-xs text-[#888888]">
                                                                        {section.instructor}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => removeClassFromDraft(section.originalIndex)}
                                                                className="absolute top-1 right-1 cursor-pointer rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                                title="Remove section"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ));
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
