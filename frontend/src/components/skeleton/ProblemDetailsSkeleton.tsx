import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function ProblemDetailsSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#e5e7eb';
    const highlightColor = isDark ? '#4b5563' : '#f3f4f6';

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 p-4">
            {/* Problem Description Panel */}
            <div className="md:w-1/2 flex flex-col overflow-hidden">
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-md overflow-hidden h-full p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <Skeleton height={24} width="50%" baseColor={baseColor} highlightColor={highlightColor} />
                        <div className="flex gap-2">
                            <Skeleton height={24} width={80} baseColor={baseColor} highlightColor={highlightColor} />
                            <Skeleton height={24} width={60} baseColor={baseColor} highlightColor={highlightColor} />
                        </div>
                    </div>

                    {/* Description Skeleton */}
                    <div className="space-y-3">
                        <Skeleton height={16} count={8} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>

                    {/* Test Cases Skeleton */}
                    <div className="mt-6 space-y-4">
                        <Skeleton height={18} width={150} baseColor={baseColor} highlightColor={highlightColor} />
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                                <Skeleton height={14} width={50} baseColor={baseColor} highlightColor={highlightColor} />
                                <Skeleton height={12} count={3} baseColor={baseColor} highlightColor={highlightColor} className="mt-2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
