import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function AdminClubRowSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#1f2937' : '#f3f4f6';
    const highlightColor = isDark ? '#374151' : '#e5e7eb';

    return (
        <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 w-1/3">
                <Skeleton width={56} height={56} borderRadius={16} baseColor={baseColor} highlightColor={highlightColor} />
                <div className="space-y-2">
                    <Skeleton width={180} height={20} baseColor={baseColor} highlightColor={highlightColor} />
                    <Skeleton width={80} height={12} baseColor={baseColor} highlightColor={highlightColor} />
                </div>
            </div>
            <div className="flex items-center gap-3 w-1/3">
                <Skeleton circle width={40} height={40} baseColor={baseColor} highlightColor={highlightColor} />
                <div className="space-y-1">
                    <Skeleton width={120} height={14} baseColor={baseColor} highlightColor={highlightColor} />
                </div>
            </div>
            <div className="flex justify-end gap-3 w-1/4">
                <Skeleton width={40} height={40} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
                <Skeleton width={40} height={40} borderRadius={12} baseColor={baseColor} highlightColor={highlightColor} />
            </div>
        </div>
    );
}
