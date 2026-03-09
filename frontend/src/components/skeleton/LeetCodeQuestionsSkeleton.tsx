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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Skeleton width={48} height={48} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                    <div className="space-y-2">
                        <Skeleton width={150} height={24} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width={200} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Skeleton width={240} height={48} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                    <Skeleton width={120} height={48} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                </div>
            </div>

            {/* List Skeleton */}
            <div className="grid gap-4">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex flex-col sm:flex-row items-center">
                            <div className="p-5 flex-1 w-full space-y-3">
                                <div className="flex gap-2">
                                    <Skeleton width={60} height={18} baseColor={baseColor} highlightColor={highlightColor} />
                                    <Skeleton width={80} height={18} baseColor={baseColor} highlightColor={highlightColor} />
                                </div>
                                <Skeleton width="60%" height={24} baseColor={baseColor} highlightColor={highlightColor} />
                            </div>
                            <div className="px-5 py-5 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 w-full sm:w-32 flex items-center justify-center">
                                <Skeleton width={80} height={36} borderRadius={8} baseColor={baseColor} highlightColor={highlightColor} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
