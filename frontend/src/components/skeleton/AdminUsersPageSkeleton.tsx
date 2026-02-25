import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';
import { AdminUserCardSkeleton } from './AdminUserCardSkeleton';

export function AdminUsersPageSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-10 w-48 rounded-lg" style={{
                        backgroundColor: isDark ? '#4b5563' : '#e5e7eb'
                    }} />
                    <div className="h-4 w-64 rounded" style={{
                        backgroundColor: isDark ? '#4b5563' : '#e5e7eb'
                    }} />
                </div>

                {/* Search Bar Skeleton */}
                <div className="relative w-full md:w-96">
                    <div className="h-12 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" style={{
                        backgroundColor: isDark ? '#4b5563' : '#e5e7eb'
                    }} />
                </div>
            </div>

            {/* User Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <AdminUserCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
