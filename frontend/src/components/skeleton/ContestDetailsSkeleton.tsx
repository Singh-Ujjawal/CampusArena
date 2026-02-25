import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function ContestDetailsSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#e5e7eb';
    const highlightColor = isDark ? '#4b5563' : '#f3f4f6';

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                    <Skeleton height={35} width="60%" baseColor={baseColor} highlightColor={highlightColor} />
                    <Skeleton height={18} width="50%" baseColor={baseColor} highlightColor={highlightColor} className="mt-2" />
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton height={40} width={140} baseColor={baseColor} highlightColor={highlightColor} />
                    <Skeleton height={40} width={140} baseColor={baseColor} highlightColor={highlightColor} />
                </div>
            </div>

            {/* Coordinators Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-6 py-4">
                <div className="flex gap-6">
                    <div className="flex-1">
                        <Skeleton height={16} width={100} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton height={28} count={2} baseColor={baseColor} highlightColor={highlightColor} className="mt-2" />
                    </div>
                    <div className="flex-1">
                        <Skeleton height={16} width={100} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton height={28} count={2} baseColor={baseColor} highlightColor={highlightColor} className="mt-2" />
                    </div>
                </div>
            </div>

            {/* Problems List */}
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-[1.5rem] border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <Skeleton height={40} width={40} circle baseColor={baseColor} highlightColor={highlightColor} />
                                <div className="flex-1">
                                    <Skeleton height={18} width="40%" baseColor={baseColor} highlightColor={highlightColor} />
                                    <Skeleton height={14} width="30%" baseColor={baseColor} highlightColor={highlightColor} className="mt-2" />
                                </div>
                            </div>
                            <Skeleton height={36} width={100} baseColor={baseColor} highlightColor={highlightColor} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
