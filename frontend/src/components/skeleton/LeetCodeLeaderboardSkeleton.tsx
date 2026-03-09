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
        <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Skeleton width={48} height={48} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                    <div className="space-y-2">
                        <Skeleton width={180} height={24} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width={150} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                </div>
                <Skeleton width={320} height={48} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
            </div>

            {/* List Skeleton */}
            <div className="flex flex-col gap-4">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="overflow-hidden border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <div className="flex flex-col md:flex-row items-center w-full">
                            {/* Rank Skeleton */}
                            <div className="w-full md:w-24 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
                                <Skeleton width={24} height={24} baseColor={baseColor} highlightColor={highlightColor} />
                                <Skeleton width={32} height={28} className="mt-1" baseColor={baseColor} highlightColor={highlightColor} />
                            </div>

                            {/* User Info Skeleton */}
                            <div className="flex-1 p-6 flex items-center gap-4 w-full">
                                <Skeleton width={56} height={56} borderRadius={16} baseColor={baseColor} highlightColor={highlightColor} />
                                <div className="space-y-2 flex-1">
                                    <Skeleton width="40%" height={24} baseColor={baseColor} highlightColor={highlightColor} />
                                    <Skeleton width="25%" height={16} baseColor={baseColor} highlightColor={highlightColor} />
                                </div>
                            </div>

                            {/* Stats Skeleton */}
                            <div className="p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 min-w-[180px] w-full md:w-auto space-y-3">
                                <Skeleton width={60} height={40} baseColor={baseColor} highlightColor={highlightColor} />
                                <Skeleton width={120} height={6} borderRadius={3} baseColor={baseColor} highlightColor={highlightColor} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
