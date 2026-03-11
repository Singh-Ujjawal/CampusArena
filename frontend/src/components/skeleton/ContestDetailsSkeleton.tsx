import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function ContestDetailsSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#1f2937' : '#f3f4f6';
    const highlightColor = isDark ? '#374151' : '#e5e7eb';

    return (
        <div className="w-full space-y-6 md:space-y-8 pb-12 animate-pulse px-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <Skeleton circle width={16} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width={150} height={10} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                    <Skeleton height={38} width="85%" baseColor={baseColor} highlightColor={highlightColor} />
                    <Skeleton height={18} width="55%" baseColor={baseColor} highlightColor={highlightColor} />
                </div>
                <div className="flex items-center gap-3 md:gap-4 shrink-0">
                    <Skeleton height={44} width={130} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                    <Skeleton height={44} width={130} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                </div>
            </div>

            {/* Stats/Info Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl md:rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm p-4 md:p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2 text-center md:text-left">
                            <Skeleton height={10} width={60} baseColor={baseColor} highlightColor={highlightColor} className="mx-auto md:mx-0" />
                            <Skeleton height={24} width={90} baseColor={baseColor} highlightColor={highlightColor} className="mx-auto md:mx-0" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Problems List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <Skeleton height={20} width={120} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton height={16} width={80} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 md:p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <Skeleton height={40} width={40} borderRadius={10} baseColor={baseColor} highlightColor={highlightColor} />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton height={18} width="60%" baseColor={baseColor} highlightColor={highlightColor} />
                                    <Skeleton height={10} width="30%" baseColor={baseColor} highlightColor={highlightColor} />
                                </div>
                            </div>
                            <Skeleton height={32} width={80} borderRadius={8} baseColor={baseColor} highlightColor={highlightColor} />
                        </div>
                    ))}
                </div>

                {/* Sidebar - Coordinators & Rules */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
                        <div className="space-y-4">
                            <Skeleton height={16} width={100} baseColor={baseColor} highlightColor={highlightColor} />
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton circle height={36} width={36} baseColor={baseColor} highlightColor={highlightColor} />
                                    <div className="flex-1 space-y-1">
                                        <Skeleton height={14} width="80%" baseColor={baseColor} highlightColor={highlightColor} />
                                        <Skeleton height={10} width="50%" baseColor={baseColor} highlightColor={highlightColor} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-gray-50 dark:border-gray-800 space-y-4">
                            <Skeleton height={16} width={120} baseColor={baseColor} highlightColor={highlightColor} />
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} height={12} width="100%" baseColor={baseColor} highlightColor={highlightColor} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
