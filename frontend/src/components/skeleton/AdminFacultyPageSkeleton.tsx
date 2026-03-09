import { AdminFacultyRowSkeleton } from './AdminFacultyRowSkeleton';

export function AdminFacultyPageSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* User List Table Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Faculty Member</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Details</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Department</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(8)].map((_, i) => (
                            <AdminFacultyRowSkeleton key={i} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
