import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function AdminSubmissionRowSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#e5e7eb';
    const highlightColor = isDark ? '#4b5563' : '#f3f4f6';

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg p-4">
            <div className="space-y-4">
                {/* Top Row - Header Info */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0 space-y-2">
                        {/* Problem Title */}
                        <Skeleton
                            width="40%"
                            height={20}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                        {/* User and Contest Info */}
                        <div className="flex items-center gap-2">
                            <Skeleton
                                width={100}
                                height={14}
                                baseColor={baseColor}
                                highlightColor={highlightColor}
                            />
                            <span className="text-gray-400">•</span>
                            <Skeleton
                                width={100}
                                height={14}
                                baseColor={baseColor}
                                highlightColor={highlightColor}
                            />
                        </div>
                    </div>

                    {/* Status Badge */}
                    <Skeleton
                        width={80}
                        height={24}
                        borderRadius={12}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                    />
                </div>

                {/* Middle Row - Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-1">
                            <Skeleton
                                width="60%"
                                height={12}
                                baseColor={baseColor}
                                highlightColor={highlightColor}
                            />
                            <Skeleton
                                width="80%"
                                height={16}
                                baseColor={baseColor}
                                highlightColor={highlightColor}
                            />
                        </div>
                    ))}
                </div>

                {/* Bottom Row - Buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Skeleton
                        width={120}
                        height={32}
                        borderRadius={6}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                    />
                    <Skeleton
                        width={120}
                        height={32}
                        borderRadius={6}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                    />
                </div>
            </div>
        </div>
    );
}
