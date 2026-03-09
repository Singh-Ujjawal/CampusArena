import { AdminClubRowSkeleton } from './AdminClubRowSkeleton';

export function AdminClubsPageSkeleton() {
    return (
        <div className="w-full space-y-8 animate-pulse">
        <div className="w-full space-y-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
                <AdminClubRowSkeleton key={i} />
            ))}
        </div>
        </div>
    );
}
