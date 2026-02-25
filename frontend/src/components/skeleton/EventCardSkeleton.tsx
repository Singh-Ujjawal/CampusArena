import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function EventCardSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#e5e7eb';
    const highlightColor = isDark ? '#4b5563' : '#f3f4f6';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-800">
            {/* Card Top — gradient skeleton */}
            <div className="bg-gray-100 dark:bg-gray-700 p-6 min-h-[120px] flex flex-col justify-between">
                <div className="flex justify-end mb-4">
                    <Skeleton width={60} height={20} baseColor={baseColor} highlightColor={highlightColor} />
                </div>
                <Skeleton
                    height={35}
                    count={2}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                    style={{ lineHeight: '1.2' }}
                />
            </div>

            {/* Card Bottom — white skeleton */}
            <div className="bg-white dark:bg-gray-900 p-5 space-y-4">
                {/* Start Time */}
                <div className="flex items-center gap-3">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                        <Skeleton width={40} height={12} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width="80%" height={16} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                </div>

                {/* End Time */}
                <div className="flex items-center gap-3">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                        <Skeleton width={40} height={12} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width="80%" height={16} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                </div>
            </div>
        </div>
    );
}
