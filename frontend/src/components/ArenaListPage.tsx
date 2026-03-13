import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Calendar, Clock, Search, Filter, Zap, Target, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ArenaCard } from './ArenaCard';

export type ArenaStatus = 'LIVE' | 'UPCOMING' | 'COMPLETED';

export interface ArenaItemBase {
    id: string;
    startTime: string;
    endTime: string;
    createdAt?: string;
    title: string;
}

export interface ArenaListPageProps<T extends ArenaItemBase> {
    title: string;
    subtitle: string;
    description: string;
    apiUrl: string;
    linkPrefix: string;
    searchPlaceholder: string;
    itemTypeLabel: (item: T, activeFilter: ArenaStatus) => string;
    itemStats: (item: T) => {
        stat1: { label: string; value: string | number; icon: any };
        stat2: { label: string; value: string | number; icon: any };
    };
    Skeleton: React.ComponentType;
}

export function ArenaListPage<T extends ArenaItemBase>({
    title,
    subtitle,
    description,
    apiUrl,
    linkPrefix,
    searchPlaceholder,
    itemTypeLabel,
    itemStats,
    Skeleton
}: ArenaListPageProps<T>) {
    const navigate = useNavigate();
    const [items, setItems] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<ArenaStatus>('LIVE');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(apiUrl);
                const fetchedItems = Array.isArray(response.data) ? response.data : [];
                
                // Sort by creation time (descending) - newest first
                const sorted = [...fetchedItems].sort((a: any, b: any) => {
                    const timeA = new Date(a.createdAt || a.startTime).getTime();
                    const timeB = new Date(b.createdAt || b.startTime).getTime();
                    return timeB - timeA;
                });
                setItems(sorted);
            } catch (error) {
                console.error(`Failed to fetch from ${apiUrl}:`, error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [apiUrl]);

    const getStatusDetails = (start: string, end: string) => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(end);
        
        if (now < startTime) {
            return { 
                label: 'UPCOMING', 
                icon: Clock,
                color: 'text-cyan-500 dark:text-cyan-400',
                bgColor: 'bg-cyan-50/60 dark:bg-cyan-500/10',
                borderColor: 'border-cyan-200/60 dark:border-cyan-500/20',
                bgGradient: 'from-cyan-500/10 to-transparent',
                activeColor: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30'
            };
        }
        if (now >= startTime && now <= endTime) {
            return { 
                label: 'LIVE NOW', 
                icon: Zap,
                color: 'text-emerald-500 dark:text-emerald-400',
                bgColor: 'bg-emerald-50/60 dark:bg-emerald-500/10',
                borderColor: 'border-emerald-200/60 dark:border-emerald-500/20',
                bgGradient: 'from-emerald-500/10 to-transparent',
                activeColor: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30'
            };
        }
        return { 
            label: 'ENDED', 
            icon: Target,
            color: 'text-violet-400 dark:text-violet-400',
            bgColor: 'bg-violet-50/60 dark:bg-violet-500/10',
            borderColor: 'border-violet-200/60 dark:border-violet-500/20',
            bgGradient: 'from-violet-500/10 to-transparent',
            activeColor: 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-violet-500/30'
        };
    };

    const getItemStatus = (start: string, end: string): ArenaStatus => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(end);
        if (now < startTime) return 'UPCOMING';
        if (now >= startTime && now <= endTime) return 'LIVE';
        return 'COMPLETED';
    };

    const filteredItems = items
        .filter(item => getItemStatus(item.startTime, item.endTime) === activeFilter)
        .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (isLoading) return <Skeleton />;

    const titleParts = title.split(' ');
    const mainTitle = titleParts[0];
    const subTitlePart = titleParts.slice(1).join(' ');

    return (
        <div className="w-full mx-auto space-y-8 pb-16 px-0 leading-tight dark:bg-transparent">
            {/* Gradient Background Effect */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <motion.div 
                    className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-600/15 to-cyan-500/10 dark:from-violet-600/20 dark:to-cyan-500/15 rounded-full blur-3xl"
                    animate={{ 
                        y: [0, 30, 0],
                        x: [-20, 20, -20]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div 
                    className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:to-cyan-500/10 rounded-full blur-3xl"
                    animate={{ 
                        y: [0, -30, 0],
                        x: [20, -20, 20]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
                <motion.div 
                    className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-violet-900/20 via-indigo-900/10 to-cyan-900/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 12, repeat: Infinity }}
                />
            </div>

            {/* Header Section */}
            <header className="space-y-6 pt-2">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <motion.div 
                            className="flex items-center gap-2 mb-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                <Trophy className="h-4 w-4 text-indigo-500" />
                            </motion.div>
                            <span className="text-[10px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-widest">{subtitle}</span>
                        </motion.div>
                        <motion.h1 
                            className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-cyan-300 dark:via-violet-300 dark:to-fuchsia-300 bg-clip-text text-transparent tracking-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            {mainTitle} <span className="italic font-bold">{subTitlePart}</span>
                        </motion.h1>
                        <motion.p 
                            className="text-sm text-gray-600 dark:text-gray-300 font-semibold max-w-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {description}
                        </motion.p>
                    </div>
                    
                    <motion.div 
                        className="relative w-full md:w-80 group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-violet-400 dark:group-focus-within:text-cyan-400 transition-all z-10" />
                        <Input
                            placeholder={searchPlaceholder}
                            className="h-11 pl-12 pr-4 bg-white/80 dark:bg-[#0d0d1a]/80 backdrop-blur-sm border border-gray-300 dark:border-violet-900/40 rounded-2xl shadow-lg focus:ring-2 focus:ring-violet-500/40 dark:focus:ring-cyan-500/30 focus:border-violet-500 dark:focus:border-cyan-500/60 transition-all text-sm font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 dark:text-gray-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </motion.div>
                </div>

                {/* Status Tabs with enhanced styling */}
                <motion.div 
                    className="flex items-center gap-2 p-1.5 bg-gradient-to-r from-gray-100/90 to-gray-50/90 dark:from-[#0d0d1a] dark:to-[#0a0a15] rounded-2xl w-fit border border-gray-200/60 dark:border-violet-900/30 shadow-lg backdrop-blur-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {[
                        { id: 'LIVE', label: 'Live Now', icon: Zap, activeColor: 'bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-500 dark:to-cyan-500 text-white shadow-lg shadow-emerald-500/40 dark:shadow-emerald-500/20' },
                        { id: 'UPCOMING', label: 'Upcoming', icon: Clock, activeColor: 'bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-cyan-500 dark:to-blue-500 text-white shadow-lg shadow-blue-500/40 dark:shadow-cyan-500/20' },
                        { id: 'COMPLETED', label: 'Past Events', icon: Target, activeColor: 'bg-gradient-to-r from-violet-600 to-purple-700 dark:from-violet-500 dark:to-fuchsia-600 text-white shadow-lg shadow-violet-500/40 dark:shadow-violet-500/20' }
                    ].map((tab) => (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id as any)}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", damping: 20 }}
                            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 relative group ${
                                activeFilter === tab.id
                                    ? `${tab.activeColor} shadow-xl scale-[1.05]`
                                    : 'text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-violet-300 hover:bg-gray-200/60 dark:hover:bg-violet-900/20'
                            }`}
                            whileHover={{ scale: activeFilter === tab.id ? 1.08 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {activeFilter === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", damping: 20 }}
                                />
                            )}
                            <tab.icon className={`h-4 w-4 relative z-10 ${activeFilter === tab.id ? 'text-white' : 'text-gray-400'}`} />
                            <span className="relative z-10">{tab.label}</span>
                        </motion.button>
                    ))}
                </motion.div>
            </header>

            {/* List Grid - Enhanced Animation Container */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFilter + searchQuery}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="grid grid-cols-1 gap-5 md:gap-6"
                    >
                        {filteredItems.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", damping: 20 }}
                                className="py-24 text-center bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-[#0d0d1a]/90 dark:to-[#0a0a15]/90 rounded-3xl border-2 border-dashed border-gray-200 dark:border-violet-900/30 backdrop-blur-sm shadow-lg"
                            >
                                <motion.div 
                                    className="h-16 w-16 bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-violet-900/40 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Filter className="h-8 w-8 text-indigo-500" />
                                </motion.div>
                                <motion.h3 
                                    className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-violet-300 dark:to-cyan-300 bg-clip-text text-transparent mb-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    No {subTitlePart || mainTitle} Found
                                </motion.h3>
                                <motion.p 
                                    className="text-sm text-gray-600 dark:text-gray-400 font-semibold"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    Adjust your filter or search query to find what you're looking for
                                </motion.p>
                            </motion.div>
                        ) : (
                            filteredItems.map((item, idx) => {
                                const status = getStatusDetails(item.startTime, item.endTime);
                                const stats = itemStats(item);
                                return (
                                    <ArenaCard
                                        key={item.id}
                                        idx={idx}
                                        id={item.id}
                                        title={item.title}
                                        startTime={item.startTime}
                                        endTime={item.endTime}
                                        typeLabel={itemTypeLabel(item, activeFilter)}
                                        status={status}
                                        stat1={stats.stat1}
                                        stat2={stats.stat2}
                                        onClick={() => navigate(`${linkPrefix}/${item.id}`)}
                                    />
                                );
                            })
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
