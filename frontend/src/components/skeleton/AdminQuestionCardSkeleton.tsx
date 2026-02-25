import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function AdminQuestionCardSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#e5e7eb';
    const highlightColor = isDark ? '#4b5563' : '#f3f4f6';

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
                {/* Left Side - Question Content */}
                <div className="flex-1 space-y-4">
                    {/* Question Header */}
                    <div className="flex items-start gap-3">
                        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0" />
                        <Skeleton
                            width="70%"
                            height={20}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 ml-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-1">
                                <Skeleton
                                    width="90%"
                                    height={16}
                                    baseColor={baseColor}
                                    highlightColor={highlightColor}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    {/* Marks Badge */}
                    <Skeleton
                        width={100}
                        height={24}
                        borderRadius={4}
                        baseColor={baseColor}
                        highlightColor={highlightColor}
                    />

                    {/* Delete Button */}
                    <Skeleton
                        width={80}
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
