import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';
import { AdminEventRowSkeleton } from './AdminEventRowSkeleton';

export function AdminEventsPageSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div className="h-8 w-48 rounded-lg" style={{
                    backgroundColor: isDark ? '#4b5563' : '#e5e7eb'
                }} />
                <div className="h-10 w-32 rounded-lg" style={{
                    backgroundColor: isDark ? '#4b5563' : '#e5e7eb'
                }} />
            </div>

            {/* Event List */}
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <AdminEventRowSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
