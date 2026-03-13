import { Calendar, Clock, ArrowRight, Target, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ArenaCardProps {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    typeLabel: string;
    status: {
        label: string;
        icon: any;
        color: string;
        bgColor: string;
        borderColor: string;
        bgGradient: string;
    };
    stat1: {
        label: string;
        value: string | number;
        icon: any;
    };
    stat2: {
        label: string;
        value: string | number;
        icon: any;
    };
    onClick: () => void;
    idx: number;
}

export function ArenaCard({
    title,
    startTime,
    endTime,
    typeLabel,
    status,
    stat1,
    stat2,
    onClick,
    idx
}: ArenaCardProps) {
    const StatusIcon = status.icon;
    const Stat1Icon = stat1.icon;
    const Stat2Icon = stat2.icon;

    const handleClick = () => {
        onClick();
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: idx * 0.05, type: "spring", damping: 15 }}
            onClick={handleClick}
            className="group cursor-pointer"
        >
            <motion.div 
                className={`relative overflow-hidden rounded-3xl p-5 md:p-6 shadow-xl transition-all cursor-pointer
                    bg-gradient-to-br from-white via-gray-50 to-gray-100 
                    dark:from-[#0d0d1a] dark:via-[#0a0a15] dark:to-[#080810]
                    border ${status.borderColor} group-hover:border-violet-500/60 dark:group-hover:border-cyan-500/40`}
                whileHover={{ 
                    y: -4,
                    boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)',
                }}
                transition={{ type: 'spring', damping: 20 }}
            >
                {/* Animated gradient background */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${status.bgGradient} opacity-40 blur-3xl pointer-events-none group-hover:opacity-70 transition-opacity duration-500`} />
                
                {/* Glow effect on hover */}
                <motion.div 
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                        background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08), transparent 70%)'
                    }}
                />
                <div className="hidden dark:block absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(6,182,212,0.07), transparent 60%)' }}
                />

                {/* Sparkle animation */}
                <motion.div
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                >
                    <Sparkles className="h-4 w-4 text-violet-500 dark:text-cyan-400 animate-pulse" />
                </motion.div>
                
                <div className="relative flex flex-col md:flex-row items-center gap-5">
                    {/* Date Badge */}
                    <motion.div 
                        className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl shrink-0 border border-gray-200 dark:border-violet-800/30
                            bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-violet-950/60 dark:to-cyan-950/40
                            shadow-md group-hover:shadow-lg dark:group-hover:shadow-violet-900/30 transition-all"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        <span className="text-[9px] font-bold text-gray-500 dark:text-cyan-400/70 uppercase tracking-wider">{new Date(startTime).toLocaleString('en-IN', { month: 'short' })}</span>
                        <span className="text-2xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-cyan-300 dark:to-violet-400 bg-clip-text text-transparent leading-none">{new Date(startTime).getDate()}</span>
                        <span className="text-[9px] font-bold text-purple-500 dark:text-violet-400">{new Date(startTime).getFullYear()}</span>
                    </motion.div>

                    {/* Main Info with stagger animation */}
                    <div className="flex-1 min-w-0 text-center md:text-left">
                        <motion.div 
                            className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 + 0.1 }}
                        >
                            <motion.span 
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${status.bgColor} ${status.color} border ${status.borderColor} shadow-sm`}
                                whileHover={{ scale: 1.05 }}
                            >
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                            </motion.span>
                            <motion.span 
                                className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-violet-900/40 dark:to-fuchsia-900/30 text-purple-700 dark:text-fuchsia-300 border border-purple-200/50 dark:border-fuchsia-700/30 shadow-sm"
                                whileHover={{ scale: 1.05 }}
                            >
                                {typeLabel}
                            </motion.span>
                        </motion.div>
                        <motion.h3 
                            className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent leading-tight truncate group-hover:from-violet-600 group-hover:to-purple-600 dark:group-hover:from-cyan-300 dark:group-hover:to-violet-300 transition-all"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 + 0.15 }}
                        >
                            {title}
                        </motion.h3>
                        <motion.div 
                            className="flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-2 text-[10px] font-bold mt-2"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 + 0.2 }}
                        >
                            <motion.div 
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-cyan-950/60 dark:to-blue-950/40 text-indigo-700 dark:text-cyan-300 rounded-lg border border-indigo-200/60 dark:border-cyan-800/30 shadow-sm"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Clock className="h-3 w-3" />
                                <span>Start: {new Date(startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </motion.div>
                            <ArrowRight className="h-3 w-3 text-gray-300 dark:text-gray-600 hidden sm:block" />
                            <motion.div 
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-rose-50 to-pink-100 dark:from-fuchsia-950/60 dark:to-violet-950/40 text-rose-700 dark:text-fuchsia-300 rounded-lg border border-rose-200/60 dark:border-fuchsia-800/30 shadow-sm"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Target className="h-3 w-3" />
                                <span>End: {new Date(endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </motion.div>
                            <motion.div 
                                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 ml-1"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                                <span>{new Date(startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Stats with gradient cards */}
                    <div className="flex items-center gap-6 shrink-0 mt-2 md:mt-0">
                        <motion.div 
                            className="flex items-center gap-4 px-4 py-3 rounded-2xl border border-gray-200/60 dark:border-violet-900/30 shadow-md
                                bg-gradient-to-br from-white/80 to-gray-50/60 dark:from-[#0d0d1a] dark:to-[#0a0a15]"
                            whileHover={{ scale: 1.05, y: -2 }}
                        >
                            <motion.div 
                                className="text-center"
                                whileHover={{ scale: 1.1 }}
                            >
                                <p className="text-[8px] font-bold text-gray-500 dark:text-violet-400/60 uppercase tracking-widest mb-1">{stat1.label}</p>
                                <div className="flex items-center justify-center gap-1 font-bold text-sm bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
                                    <Stat1Icon className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300" />
                                    {stat1.value}
                                </div>
                            </motion.div>
                            <div className="w-px h-7 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-violet-800/50 dark:to-cyan-900/30" />
                            <motion.div 
                                className="text-center"
                                whileHover={{ scale: 1.1 }}
                            >
                                <p className="text-[8px] font-bold text-gray-500 dark:text-cyan-400/60 uppercase tracking-widest mb-1">{stat2.label}</p>
                                <div className="flex items-center justify-center gap-1 font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-cyan-300 dark:to-violet-400 bg-clip-text text-transparent">
                                    <Stat2Icon className="h-3.5 w-3.5 text-indigo-500 dark:text-cyan-400" />
                                    {stat2.value}
                                </div>
                            </motion.div>
                        </motion.div>
                        
                        {/* Arrow button */}
                        <motion.div 
                            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-700 dark:from-cyan-500 dark:to-violet-600 shadow-lg shadow-violet-600/40 dark:shadow-cyan-500/20 group-hover:shadow-violet-600/60 dark:group-hover:shadow-cyan-500/40 cursor-pointer"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.div 
                                className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 to-purple-400 dark:from-cyan-400 dark:to-violet-400 opacity-0 group-hover:opacity-30"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform relative z-10" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
