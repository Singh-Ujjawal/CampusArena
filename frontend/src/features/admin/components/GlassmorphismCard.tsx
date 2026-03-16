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
        'Quiz Studio': 'from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 hover:from-blue-200 hover:to-cyan-200 dark:hover:from-blue-800/60 dark:hover:to-cyan-800/60',
        'Contest Studio': 'from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 hover:from-indigo-200 hover:to-violet-200 dark:hover:from-indigo-800/60 dark:hover:to-violet-800/60',
        'Manage Problems': 'from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 hover:from-violet-200 hover:to-purple-200 dark:hover:from-violet-800/60 dark:hover:to-purple-800/60',
        'Manage Users': 'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-800/60 dark:hover:to-teal-800/60',
        'Manage Clubs': 'from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 hover:from-amber-200 hover:to-orange-200 dark:hover:from-amber-800/60 dark:hover:to-orange-800/60',
        'Manage Faculty': 'from-sky-100 to-indigo-100 dark:from-sky-900/40 dark:to-indigo-900/40 hover:from-sky-200 hover:to-indigo-200 dark:hover:from-sky-800/60 dark:hover:to-indigo-800/60',
        'Event Analytics': 'from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-800/60 dark:hover:to-indigo-800/60',
        'All Submissions': 'from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40 hover:from-teal-200 hover:to-emerald-200 dark:hover:from-teal-800/60 dark:hover:to-emerald-800/60',
        'Registration Hub': 'from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40 hover:from-cyan-200 hover:to-teal-200 dark:hover:from-cyan-800/60 dark:hover:to-teal-800/60',
        'LeetCode Questions': 'from-orange-100 to-yellow-100 dark:from-orange-900/40 dark:to-yellow-900/40 hover:from-orange-200 hover:to-yellow-200 dark:hover:from-orange-800/60 dark:hover:to-yellow-800/60',
        'Collective Details': 'from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40 hover:from-indigo-200 hover:to-blue-200 dark:hover:from-indigo-800/60 dark:hover:to-blue-800/60',
        'Event Reports': 'from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/40 hover:from-violet-200 hover:to-fuchsia-200 dark:hover:from-violet-800/60 dark:hover:to-fuchsia-800/60',
    };

    const iconColors: Record<string, string> = {
        'Quiz Studio': 'text-blue-600 dark:text-blue-400',
        'Contest Studio': 'text-indigo-600 dark:text-indigo-400',
        'Manage Problems': 'text-violet-600 dark:text-violet-400',
        'Manage Users': 'text-emerald-600 dark:text-emerald-400',
        'Manage Clubs': 'text-amber-600 dark:text-amber-400',
        'Manage Faculty': 'text-sky-600 dark:text-sky-400',
        'Event Analytics': 'text-blue-600 dark:text-blue-400',
        'All Submissions': 'text-teal-600 dark:text-teal-400',
        'Registration Hub': 'text-cyan-600 dark:text-cyan-400',
        'LeetCode Questions': 'text-orange-600 dark:text-orange-400',
        'Collective Details': 'text-indigo-600 dark:text-indigo-400',
        'Event Reports': 'text-violet-600 dark:text-violet-400',
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
