'use client';

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface NewClassProps {
    classID: string;
    className: string;
    dept: string;
    code: string;
    startTime: string;
    endTime: string;
    days: string;
    instructor?: string;
}

interface SelectedClass {
    classID: string;
    className: string;
    dept: string;
    code: string;
    startTime: string;
    endTime: string;
    days: string;
    instructor?: string;
}

export default function NewClass(props: NewClassProps) {
    const [selectedClasses, setSelectedClasses] = useState<SelectedClass[]>([]);

    const handleClick = (classID: string, className: string, dept: string, code: string, startTime: string, endTime: string, days: string, instructor?: string) => {
        const isAlreadyPresent = selectedClasses.some((cls) => cls.classID === classID);
        const selected = isAlreadyPresent;

        if (selected) {
            setSelectedClasses((prevClasses) =>
                prevClasses.filter((item) => item.classID !== classID)
            );
        } else {
            setSelectedClasses((prevClasses) => [
                ...prevClasses,
                { classID, className, dept, code, startTime, endTime, days, instructor },
            ]);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.2, opacity: 0 }}
                key={props.classID}
                className="flex flex-col p-2 my-2 rounded-md text-[#fafafa] border-2 border-[#404040] bg-transparent justify-start items-center"
            >
                <h1 className="font-dmsans text-lg font-bold self-start">
                    {props.dept} {props.code}: {props.className}
                </h1>
                <button
                    className={`w-full font-inter rounded-md mt-2 cursor-pointer hover:bg-[#2c2c2c] ${
                        selectedClasses.some(cls => cls.classID === props.classID) ? 'bg-green-950' : ''
                    } transition duration-100`}
                    onClick={() =>
                        handleClick(
                            props.classID,
                            props.className,
                            props.dept,
                            props.code,
                            props.startTime,
                            props.endTime,
                            props.days,
                            props.instructor
                        )
                    }
                >
                    <table className="w-full">
                        <tbody>
                            <tr className="text-left">
                                <td className="pt-2 px-1 font-semibold">#{props.classID}</td>
                                <td className="pt-2">{props.days} {props.startTime} - {props.endTime}</td>
                            </tr>
                            <tr className="text-left">
                                <td></td>
                                <td className="pb-2 text-xs text-[#a8a8a8]">{props.instructor}</td>
                            </tr>
                        </tbody>
                    </table>
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
