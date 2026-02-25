'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        let timer = setInterval(() => {
            start += end / 30;
            if (start > end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 50);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{count}{suffix}</span>;
};

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: number;
    color: string;
    suffix?: string;
    delay?: number;
}

export const StatCard = ({ icon: Icon, label, value, color, suffix = '', delay = 0 }: StatCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
            className="relative group"
        >
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-200/30 to-purple-200/30 dark:from-blue-950 dark:to-purple-950 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />

            <div className="relative rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 border border-blue-200/50 dark:border-slate-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
                        <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 ${color}`}>
                            <AnimatedCounter value={value} suffix={suffix} />
                        </p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${color.replace('text-', 'bg-')}/10 text-lg flex-shrink-0`}>
                        <Icon className={`h-5 sm:h-6 w-5 sm:w-6 ${color}`} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
