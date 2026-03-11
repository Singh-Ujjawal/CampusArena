import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/card';

export function LeetCodeLeaderboardSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#1f2937' : '#f3f4f6';
    const highlightColor = isDark ? '#374151' : '#e5e7eb';

    return (
        <div className="space-y-6 animate-pulse pb-12">
            {/* Redesigned Compact Header Skeleton */}
            <div className="relative bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Skeleton width={40} height={40} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                    <div className="flex items-center gap-3">
                        <Skeleton width={180} height={28} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width={100} height={32} borderRadius={8} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                </div>

                <Skeleton width={280} height={36} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
            </div>

            {/* Table Skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mt-4">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between">
                    <Skeleton width={60} height={12} baseColor={baseColor} highlightColor={highlightColor} />
                    <Skeleton width={100} height={12} baseColor={baseColor} highlightColor={highlightColor} />
                    <Skeleton width={40} height={12} baseColor={baseColor} highlightColor={highlightColor} />
                    <Skeleton width={80} height={12} baseColor={baseColor} highlightColor={highlightColor} />
                    <Skeleton width={24} height={12} baseColor={baseColor} highlightColor={highlightColor} />
                </div>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="p-6 flex items-center gap-4">
                        <Skeleton width={32} height={32} borderRadius={8} baseColor={baseColor} highlightColor={highlightColor} />
                        <div className="flex items-center gap-4 flex-1">
                            <Skeleton width={40} height={40} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                            <div className="space-y-1">
                                <Skeleton width={140} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                                <Skeleton width={80} height={12} baseColor={baseColor} highlightColor={highlightColor} />
                            </div>
                        </div>
                        <Skeleton width={60} height={24} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width={120} height={6} borderRadius={3} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width={36} height={36} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                ))}
            </div>
        </div>
    );
}
