import { EventCardSkeleton } from './EventCardSkeleton';
import { ContestCardSkeleton } from './ContestCardSkeleton';
import { SearchFilterSkeleton } from './SearchFilterSkeleton';
import { useTheme } from '@/context/ThemeContext';

export function DashboardSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header skeleton */}
            <div className="mb-8">
                <div className={`h-8 w-48 rounded-lg mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div className={`h-4 w-96 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>

            {/* Search and Filter */}
            <SearchFilterSkeleton />

            {/* Events Section */}
            <div className="mb-12">
                <div className={`h-7 w-40 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <EventCardSkeleton key={`event-${i}`} />
                    ))}
                </div>
            </div>

            {/* Contests Section */}
            <div>
                <div className={`h-7 w-40 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <ContestCardSkeleton key={`contest-${i}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}
