import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function ContestListPageSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#1f2937' : '#f3f4f6';
    const highlightColor = isDark ? '#374151' : '#e5e7eb';

    return (
        <div className="w-full mx-auto space-y-8 pb-16 px-0 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-6 pt-2">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                            <Skeleton circle width={16} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                            <Skeleton width={100} height={10} baseColor={baseColor} highlightColor={highlightColor} />
                        </div>
                        <Skeleton width="40%" height={32} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width="60%" height={16} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                    <div className="w-full md:w-72 h-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
                </div>
                <div className="h-10 w-full md:w-80 rounded-xl bg-gray-100 dark:bg-gray-800" />
            </div>

            {/* List Skeleton */}
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col md:flex-row items-center gap-5">
                        <Skeleton width={64} height={64} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                        <div className="flex-1 space-y-2 w-full">
                            <Skeleton width={80} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                            <Skeleton width="50%" height={24} baseColor={baseColor} highlightColor={highlightColor} />
                            <Skeleton width="30%" height={12} baseColor={baseColor} highlightColor={highlightColor} />
                        </div>
                        <div className="hidden md:flex h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800" />
                    </div>
                ))}
            </div>
        </div>
    );
}
