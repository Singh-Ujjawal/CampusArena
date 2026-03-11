import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function EventDetailsSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#1f2937' : '#f3f4f6';
    const highlightColor = isDark ? '#374151' : '#e5e7eb';

    return (
        <div className="w-full space-y-6 md:space-y-8 pb-12 animate-pulse px-0">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl md:rounded-[2rem] shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-5 md:p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-8">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                            <Skeleton circle width={16} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                            <Skeleton width={120} height={10} baseColor={baseColor} highlightColor={highlightColor} />
                        </div>
                        <Skeleton
                            width="85%"
                            height={32}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                        <Skeleton
                            width="60%"
                            height={16}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                    </div>
                    <Skeleton
                        width={110}
                        height={28}
                        borderRadius={12}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                        className="self-start md:self-center"
                    />
                </div>

                {/* Content */}
                <div className="p-5 md:p-8 space-y-8 md:space-y-10">
                    {/* Calendar and Clock Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-700/30">
                                <Skeleton circle width={40} height={40} baseColor={baseColor} highlightColor={highlightColor} />
                                <div className="flex-1 space-y-2">
                                    <Skeleton
                                        width="40%"
                                        height={10}
                                        baseColor={baseColor}
                                        highlightColor={highlightColor}
                                    />
                                    <Skeleton
                                        width="90%"
                                        height={16}
                                        baseColor={baseColor}
                                        highlightColor={highlightColor}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Description/About */}
                    <div className="space-y-4">
                        <Skeleton width={140} height={20} baseColor={baseColor} highlightColor={highlightColor} />
                        <div className="space-y-2.5">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    width={i === 3 ? "60%" : "100%"}
                                    height={14}
                                    baseColor={baseColor}
                                    highlightColor={highlightColor}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Coordinators */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Skeleton circle width={20} height={20} baseColor={baseColor} highlightColor={highlightColor} />
                                    <Skeleton width={120} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[...Array(2)].map((_, j) => (
                                        <div key={j} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <Skeleton circle width={32} height={32} baseColor={baseColor} highlightColor={highlightColor} />
                                            <div className="space-y-1.5 flex-1">
                                                <Skeleton width="80%" height={12} baseColor={baseColor} highlightColor={highlightColor} />
                                                <Skeleton width="50%" height={10} baseColor={baseColor} highlightColor={highlightColor} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 md:p-8 border-t border-gray-50 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
                    <Skeleton
                        width="100%"
                        height={48}
                        borderRadius={12}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                        className="sm:w-32"
                    />
                    <Skeleton
                        width="100%"
                        height={48}
                        borderRadius={12}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                        className="sm:w-48"
                    />
                </div>
            </div>
        </div>

    );
}
