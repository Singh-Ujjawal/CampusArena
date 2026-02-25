import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function SearchFilterSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#e5e7eb';
    const highlightColor = isDark ? '#4b5563' : '#f3f4f6';

    return (
        <div className="space-y-4 mb-8">
            {/* Search bar skeleton */}
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <Skeleton width="100%" height={20} baseColor={baseColor} highlightColor={highlightColor} />
            </div>

            {/* Filter buttons skeleton */}
            <div className="flex gap-3 flex-wrap">
                {[...Array(4)].map((_, i) => (
                    <Skeleton
                        key={i}
                        width={90}
                        height={36}
                        borderRadius={8}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                    />
                ))}
            </div>
        </div>
    );
}
