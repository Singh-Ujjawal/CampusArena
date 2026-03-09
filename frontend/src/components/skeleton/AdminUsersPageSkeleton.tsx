import { useTheme } from '@/context/ThemeContext';
import { AdminUserRowSkeleton } from './AdminUserRowSkeleton';

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

            {/* User List Table Skeleton */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">User</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Contact</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Identification</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Academic</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(8)].map((_, i) => (
                            <AdminUserRowSkeleton key={i} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
