'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface GlassmorphismCardProps {
    name: string;
    href: string;
    icon: LucideIcon;
    gradientBg: string;
    delay: number;
}

export const GlassmorphismCard = ({ name, href, icon: Icon, gradientBg, delay }: GlassmorphismCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const bgGradients: Record<string, string> = {
        'Quiz Studio': 'from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950 hover:from-blue-200 hover:to-cyan-200 dark:hover:from-blue-900 dark:hover:to-cyan-900',
        'Contest Studio': 'from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-900 dark:hover:to-purple-900',
        'Manage Problems': 'from-rose-100 to-pink-100 dark:from-rose-950 dark:to-pink-950 hover:from-rose-200 hover:to-pink-200 dark:hover:from-rose-900 dark:hover:to-pink-900',
        'Manage Users': 'from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-900 dark:hover:to-teal-900',
        'Event Analytics': 'from-violet-100 to-fuchsia-100 dark:from-violet-950 dark:to-fuchsia-950 hover:from-violet-200 hover:to-fuchsia-200 dark:hover:from-violet-900 dark:hover:to-fuchsia-900',
        'All Submissions': 'from-lime-100 to-green-100 dark:from-lime-950 dark:to-green-950 hover:from-lime-200 hover:to-green-200 dark:hover:from-lime-900 dark:hover:to-green-900',
    };

    const iconColors: Record<string, string> = {
        'Quiz Studio': 'text-blue-600 dark:text-cyan-400',
        'Contest Studio': 'text-indigo-600 dark:text-purple-400',
        'Manage Problems': 'text-rose-600 dark:text-pink-400',
        'Manage Users': 'text-emerald-600 dark:text-teal-400',
        'Event Analytics': 'text-violet-600 dark:text-fuchsia-400',
        'All Submissions': 'text-lime-600 dark:text-green-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, type: 'spring' }}
            whileHover={{ y: -8 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={href}>
                <div className="relative group h-full cursor-pointer">
                    {/* Card Background */}
                    <div
                        className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${bgGradients[name as keyof typeof bgGradients]} border border-slate-300/60 dark:border-slate-700/50 transition-all duration-300 ${isHovered ? 'shadow-xl' : 'shadow-md'
                            }`}
                    />

                    {/* Content */}
                    <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col justify-between">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-1 sm:mb-2 truncate">
                                    {name}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400">Manage & monitor</p>
                            </div>
                            <motion.div
                                animate={{ rotate: isHovered ? 12 : 0 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white dark:bg-slate-700 shadow-lg flex-shrink-0`}
                            >
                                <Icon className={`h-5 sm:h-6 w-5 sm:w-6 ${iconColors[name as keyof typeof iconColors]}`} />
                            </motion.div>
                        </div>

                        {/* Arrow */}
                        <motion.div
                            animate={{ x: isHovered ? 4 : 0 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-300"
                        >
                            Access <span className="text-base sm:text-lg">→</span>
                        </motion.div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};
