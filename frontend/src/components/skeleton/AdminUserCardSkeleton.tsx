import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function AdminUserCardSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#e5e7eb';
    const highlightColor = isDark ? '#4b5563' : '#f3f4f6';

    return (
        <div className="group h-full flex flex-col">
            <div className="block h-full flex-1">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-600 shadow-md rounded-2xl bg-white dark:bg-gray-900 h-full flex flex-col">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <div className="h-5 w-5 bg-white/30 rounded" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Skeleton
                                        width="80%"
                                        height={20}
                                        baseColor="#1e40af"
                                        highlightColor="#3b82f6"
                                    />
                                    <Skeleton
                                        width="60%"
                                        height={12}
                                        baseColor="#1e40af"
                                        highlightColor="#3b82f6"
                                        style={{ marginTop: '4px' }}
                                    />
                                </div>
                            </div>
                            <Skeleton
                                width={50}
                                height={20}
                                borderRadius={4}
                                baseColor="#1e40af"
                                highlightColor="#3b82f6"
                            />
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 space-y-4 flex-grow">
                        <div className="space-y-3">
                            {/* Email */}
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                <Skeleton
                                    width="70%"
                                    height={14}
                                    baseColor={baseColor}
                                    highlightColor={highlightColor}
                                />
                            </div>

                            {/* Roll Number */}
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                <Skeleton
                                    width="50%"
                                    height={14}
                                    baseColor={baseColor}
                                    highlightColor={highlightColor}
                                />
                            </div>

                            {/* Course & Branch */}
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <Skeleton
                                    height={32}
                                    borderRadius={6}
                                    baseColor={baseColor}
                                    highlightColor={highlightColor}
                                />
                                <Skeleton
                                    height={32}
                                    borderRadius={6}
                                    baseColor={baseColor}
                                    highlightColor={highlightColor}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Delete Button */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                        <Skeleton
                            width={100}
                            height={32}
                            borderRadius={8}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
