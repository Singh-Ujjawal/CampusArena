import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function EventDetailsSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#e5e7eb';
    const highlightColor = isDark ? '#4b5563' : '#f3f4f6';

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <Skeleton
                            width="70%"
                            height={28}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                    </div>
                    <Skeleton
                        width={100}
                        height={24}
                        borderRadius={12}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                    />
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Calendar and Clock Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 mt-1" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton
                                        width="60%"
                                        height={14}
                                        baseColor={baseColor}
                                        highlightColor={highlightColor}
                                    />
                                    <Skeleton
                                        width="80%"
                                        height={18}
                                        baseColor={baseColor}
                                        highlightColor={highlightColor}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Coordinators */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 mt-1" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton
                                        width="70%"
                                        height={14}
                                        baseColor={baseColor}
                                        highlightColor={highlightColor}
                                    />
                                    <div className="flex gap-2 flex-wrap">
                                        {[...Array(2)].map((_, j) => (
                                            <Skeleton
                                                key={j}
                                                width={80}
                                                height={24}
                                                borderRadius={12}
                                                baseColor={baseColor}
                                                highlightColor={highlightColor}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Instructions Box */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 space-y-3">
                        <Skeleton
                            width="50%"
                            height={16}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                        <div className="space-y-2">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    width="90%"
                                    height={14}
                                    baseColor={baseColor}
                                    highlightColor={highlightColor}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                    <Skeleton
                        width={120}
                        height={40}
                        borderRadius={6}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                    />
                    <Skeleton
                        width={120}
                        height={40}
                        borderRadius={6}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                    />
                </div>
            </div>
        </div>
    );
}
