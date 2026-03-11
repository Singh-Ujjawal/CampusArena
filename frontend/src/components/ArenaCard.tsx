import { Calendar, Clock, ArrowRight, Target } from 'lucide-react';
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

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, delay: idx * 0.03 }}
            onClick={onClick}
            className="group cursor-pointer"
        >
            <div className={`relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border ${status.borderColor} hover:border-indigo-500/40 transition-all p-4 md:p-5 shadow-sm hover:shadow-md dark:shadow-none`}>
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${status.bgGradient} opacity-30 blur-2xl pointer-events-none group-hover:opacity-50 transition-opacity`} />
                
                <div className="relative flex flex-col md:flex-row items-center gap-5">
                    {/* Date Badge */}
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gray-50 dark:bg-gray-800/50 shrink-0 border border-gray-100 dark:border-gray-700/30 group-hover:bg-white dark:group-hover:bg-gray-900 transition-colors">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{new Date(startTime).toLocaleString('en-IN', { month: 'short' })}</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white leading-none">{new Date(startTime).getDate()}</span>
                        <span className="text-[9px] font-bold text-indigo-500/70">{new Date(startTime).getFullYear()}</span>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${status.bgColor} ${status.color} border ${status.borderColor}`}>
                                <StatusIcon className="h-2.5 w-2.5" />
                                {status.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50">
                                {typeLabel}
                            </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {title}
                        </h3>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-2 text-[10px] font-bold mt-1.5">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-100/50 dark:border-indigo-800/30">
                                <Clock className="h-3 w-3" />
                                <span>Start: {new Date(startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <ArrowRight className="h-3 w-3 text-gray-300 hidden sm:block" />
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-md border border-rose-100/50 dark:border-rose-800/30">
                                <Target className="h-3 w-3" />
                                <span>End: {new Date(endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 ml-1">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <span>{new Date(startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats & CTA */}
                    <div className="flex items-center gap-6 shrink-0 mt-2 md:mt-0">
                        <div className="flex items-center gap-4 px-4 py-2 bg-gray-50/30 dark:bg-gray-800/20 rounded-xl border border-gray-100/30 dark:border-gray-700/20">
                            <div className="text-center">
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{stat1.label}</p>
                                <div className="flex items-center justify-center gap-1 font-bold text-sm text-gray-900 dark:text-white">
                                    <Stat1Icon className="h-3 w-3 text-amber-500" />
                                    {stat1.value}
                                </div>
                            </div>
                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700/50" />
                            <div className="text-center">
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{stat2.label}</p>
                                <div className="flex items-center justify-center gap-1 font-bold text-sm text-gray-900 dark:text-white">
                                    <Stat2Icon className="h-3 w-3 text-indigo-500" />
                                    {stat2.value}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-all">
                            <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
