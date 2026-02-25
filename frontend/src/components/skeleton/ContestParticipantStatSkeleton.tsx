import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function ContestParticipantStatSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#e5e7eb';
    const highlightColor = isDark ? '#4b5563' : '#f3f4f6';

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton
                    width="60%"
                    height={12}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                />
                <Skeleton
                    width="40%"
                    height={24}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                />
            </div>
        </div>
    );
}
