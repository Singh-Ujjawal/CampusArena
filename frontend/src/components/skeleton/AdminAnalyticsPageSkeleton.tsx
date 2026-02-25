import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function AdminAnalyticsPageSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#e5e7eb';
    const highlightColor = isDark ? '#4b5563' : '#f3f4f6';

    return (
        <div className="space-y-6">
            {/* Title */}
            <div className="h-8 w-64 rounded-lg" style={{
                backgroundColor: isDark ? '#4b5563' : '#e5e7eb'
            }} />

            {/* Analytics Cards */}
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg p-6"
                    >
                        <div className="flex justify-between items-center gap-4">
                            {/* Left Side - Event Info */}
                            <div className="flex-1 space-y-3">
                                {/* Title */}
                                <Skeleton
                                    width="50%"
                                    height={20}
                                    baseColor={baseColor}
                                    highlightColor={highlightColor}
                                />
                                {/* Date */}
                                <Skeleton
                                    width="40%"
                                    height={16}
                                    baseColor={baseColor}
                                    highlightColor={highlightColor}
                                />
                            </div>

                            {/* Right Side - Action Buttons */}
                            <div className="flex gap-2 flex-shrink-0">
                                {[...Array(2)].map((_, j) => (
                                    <Skeleton
                                        key={j}
                                        width={100}
                                        height={32}
                                        borderRadius={6}
                                        baseColor={baseColor}
                                        highlightColor={highlightColor}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
