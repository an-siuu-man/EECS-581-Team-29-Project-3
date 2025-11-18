import React from "react";
import { motion } from "framer-motion";


export default function Loader() {
    return (
        <div className="w-8 h-8 flex items-center justify-center bg-transparent">
            <motion.div
                className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
            />
        </div>
    );
}