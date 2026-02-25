import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';
import { AdminSubmissionRowSkeleton } from './AdminSubmissionRowSkeleton';

export function AdminSubmissionsPageSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-64 rounded-lg" style={{
                        backgroundColor: isDark ? '#4b5563' : '#e5e7eb'
                    }} />
                    <div className="h-4 w-80 rounded" style={{
                        backgroundColor: isDark ? '#4b5563' : '#e5e7eb'
                    }} />
                </div>

                {/* Search Bar Skeleton */}
                <div className="relative w-full md:w-96 h-10 rounded-lg" style={{
                    backgroundColor: isDark ? '#4b5563' : '#e5e7eb'
                }} />
            </div>

            {/* Submission List */}
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <AdminSubmissionRowSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
