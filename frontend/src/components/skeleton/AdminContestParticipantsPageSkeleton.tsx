import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';
import { ContestParticipantStatSkeleton } from './ContestParticipantStatSkeleton';
import { ContestParticipantRowSkeleton } from './ContestParticipantRowSkeleton';

export function AdminContestParticipantsPageSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#4b5563' : '#e5e7eb';

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3">
                    <Skeleton
                        width={150}
                        height={16}
                        baseColor={baseColor}
                    />
                    <Skeleton
                        width={300}
                        height={32}
                        borderRadius={8}
                        baseColor={baseColor}
                    />
                    <Skeleton
                        width={350}
                        height={16}
                        baseColor={baseColor}
                    />
                </div>
                <div>
                    <Skeleton
                        width={120}
                        height={40}
                        borderRadius={8}
                        baseColor={baseColor}
                    />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <ContestParticipantStatSkeleton key={i} />
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-50 dark:border-gray-800">
                    <Skeleton
                        width="100%"
                        height={40}
                        borderRadius={12}
                        baseColor={baseColor}
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                                <th className="px-6 py-4">
                                    <Skeleton width="60%" height={12} baseColor={baseColor} />
                                </th>
                                <th className="px-6 py-4">
                                    <Skeleton width="70%" height={12} baseColor={baseColor} />
                                </th>
                                <th className="px-6 py-4">
                                    <Skeleton width="50%" height={12} baseColor={baseColor} />
                                </th>
                                <th className="px-6 py-4">
                                    <Skeleton width="50%" height={12} baseColor={baseColor} />
                                </th>
                                <th className="px-6 py-4">
                                    <Skeleton width="60%" height={12} baseColor={baseColor} />
                                </th>
                                <th className="px-6 py-4">
                                    <Skeleton width="40%" height={12} baseColor={baseColor} style={{ marginLeft: 'auto', display: 'block' }} />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {[...Array(5)].map((_, i) => (
                                <ContestParticipantRowSkeleton key={i} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
