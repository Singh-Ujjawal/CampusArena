import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/card';

export function LeetCodeQuestionsSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#1f2937' : '#f3f4f6';
    const highlightColor = isDark ? '#374151' : '#e5e7eb';

    return (
        <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Skeleton width={48} height={48} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                    <div className="space-y-1">
                        <Skeleton width={180} height={32} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width={140} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                </div>
            </div>

            {/* Controls Skeleton - Aligned with Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-3 mt-4">
                <Skeleton width={280} height={40} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                <div className="flex gap-2">
                    <Skeleton width={110} height={40} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                    <Skeleton width={110} height={40} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                </div>
            </div>

            {/* List Skeleton */}
            <div className="grid gap-4 mt-6">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 border shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center">
                            <div className="p-4 flex-1 w-full">
                                <div className="flex items-start gap-4">
                                    <Skeleton circle width={24} height={24} baseColor={baseColor} highlightColor={highlightColor} />
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <Skeleton width={50} height={18} borderRadius={4} baseColor={baseColor} highlightColor={highlightColor} />
                                            <Skeleton width={70} height={18} borderRadius={4} baseColor={baseColor} highlightColor={highlightColor} />
                                        </div>
                                        <Skeleton width="45%" height={24} baseColor={baseColor} highlightColor={highlightColor} />
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-4 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 w-full sm:w-[170px] flex items-center justify-center">
                                <Skeleton width={110} height={36} borderRadius={8} baseColor={baseColor} highlightColor={highlightColor} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
