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
                color: 'text-blue-500 dark:text-blue-400',
                bgColor: 'bg-blue-50/50 dark:bg-blue-900/10',
                borderColor: 'border-blue-100/50 dark:border-blue-800/30',
                bgGradient: 'from-blue-500/5 to-transparent',
                activeColor: 'bg-blue-600 text-white shadow-blue-200 dark:shadow-none'
            };
        }
        if (now >= startTime && now <= endTime) {
            return { 
                label: 'LIVE NOW', 
                icon: Zap,
                color: 'text-emerald-500 dark:text-emerald-400',
                bgColor: 'bg-emerald-50/50 dark:bg-emerald-900/10',
                borderColor: 'border-emerald-100/50 dark:border-emerald-800/30',
                bgGradient: 'from-emerald-500/5 to-transparent',
                activeColor: 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none'
            };
        }
        return { 
            label: 'ENDED', 
            icon: Target,
            color: 'text-slate-400 dark:text-slate-500',
            bgColor: 'bg-slate-50/50 dark:bg-slate-800/10',
            borderColor: 'border-slate-200/50 dark:border-slate-700/30',
            bgGradient: 'from-slate-500/5 to-transparent',
            activeColor: 'bg-slate-700 text-white shadow-slate-200 dark:shadow-none'
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
        <div className="w-full mx-auto space-y-8 pb-16 px-0 leading-tight">
            {/* Header Section */}
            <header className="space-y-6 pt-2">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy className="h-4 w-4 text-indigo-500" />
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{subtitle}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {mainTitle} <span className="text-indigo-600 italic">{subTitlePart}</span>
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-lg">
                            {description}
                        </p>
                    </div>
                    
                    <div className="relative w-full md:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-all" />
                        <Input
                            placeholder={searchPlaceholder}
                            className="h-10 pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 p-1.5 bg-gray-100/80 dark:bg-gray-800/40 rounded-[1.25rem] w-fit border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                    {[
                        { id: 'LIVE', label: 'Live Now', icon: Zap, activeColor: 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none' },
                        { id: 'UPCOMING', label: 'Upcoming', icon: Clock, activeColor: 'bg-blue-600 text-white shadow-blue-200 dark:shadow-none' },
                        { id: 'COMPLETED', label: 'Past Events', icon: Target, activeColor: 'bg-slate-700 text-white shadow-slate-200 dark:shadow-none' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${
                                activeFilter === tab.id
                                    ? `${tab.activeColor} shadow-lg scale-[1.02]`
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <tab.icon className={`h-3.5 w-3.5 ${activeFilter === tab.id ? 'text-white' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* List Grid - Improved Animation Container */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFilter + searchQuery} // Re-animate entire list on filter/search change
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="grid grid-cols-1 gap-4"
                    >
                        {filteredItems.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-20 text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800"
                            >
                                <div className="h-12 w-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Filter className="h-6 w-6 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No {subTitlePart || mainTitle} Found</h3>
                                <p className="text-sm text-gray-500 font-medium">Adjust your filter or search query</p>
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
