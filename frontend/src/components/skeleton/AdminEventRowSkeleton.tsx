import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function AdminEventRowSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#e5e7eb';
    const highlightColor = isDark ? '#4b5563' : '#f3f4f6';

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
                {/* Left Side - Event Info */}
                <div className="flex-1 space-y-3">
                    {/* Title */}
                    <Skeleton
                        width="50%"
                        height={20}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                    />

                    {/* Start Date & Status */}
                    <div className="flex items-center gap-2">
                        <Skeleton
                            width="40%"
                            height={16}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                        <Skeleton
                            width={80}
                            height={16}
                            borderRadius={4}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                    </div>

                    {/* Coordinators Info */}
                    <Skeleton
                        width="60%"
                        height={12}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                    />
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton
                            key={i}
                            width={90}
                            height={32}
                            borderRadius={6}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
