import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type User } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash, Search, User as UserIcon, Mail, Hash, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { AdminUsersPageSkeleton } from '@/components/skeleton';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({ open: false, userId: null });

    const fetchUsers = useCallback(async (query = '') => {
        try {
            const response = await api.get(query ? `/user/search?query=${query}` : '/user');
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    }, []);


    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                setIsSearching(true);
                fetchUsers(searchQuery);
            } else {
                fetchUsers();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, fetchUsers]);

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/user/${id}`);
            toast.success('User deleted successfully');
            fetchUsers(searchQuery);
        } catch (error) {
            toast.error('Failed to delete user');
        }
        setDeleteDialog({ open: false, userId: null });
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Manage Users</h1>
                    <p className="text-gray-500 dark:text-gray-300 mt-2">View and manage all registered participants in the system.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className={`h-5 w-5 ${isSearching ? 'animate-pulse text-blue-500' : 'text-gray-400'}`} />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search by name, roll, email, branch..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 h-12 bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-xl text-gray-900 dark:text-gray-100"
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {isLoading && users.length === 0 ? (
                <AdminUsersPageSkeleton />
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">User</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Identification</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Academic</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <Link to={`/admin/users/${user.id}`} className="flex items-center gap-3 group">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <UserIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100 leading-none">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">@{user.username}</p>
                                            </div>
                                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                                                user.role === 'ADMIN' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="truncate max-w-[200px]">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                            <Hash className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">{user.rollNumber || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[11px] font-bold border border-blue-100 dark:border-blue-800">
                                                {user.course}
                                            </span>
                                            {user.branch && (
                                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-[11px] font-bold border border-indigo-100 dark:border-indigo-800">
                                                    {user.branch}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                className="h-8 w-8 p-0 rounded-lg group-hover:scale-110 transition-transform"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setDeleteDialog({ open: true, userId: user.id });
                                                }}
                                                title="Delete User"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!isLoading && users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-500">
                    <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-300 font-medium">No users found matching "{searchQuery}"</p>
                    <Button variant="ghost" onClick={clearSearch} className="mt-2 text-blue-600 dark:text-blue-400 hover:bg-transparent">Clear Search</Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 max-w-sm w-full border border-gray-200 dark:border-gray-600">
                        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Confirm Delete</h2>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">Are you sure you want to delete this user? This action is <span className="font-bold text-red-600">permanent</span>.</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, userId: null })} className="rounded-lg">Cancel</Button>
                            <Button variant="danger" onClick={() => deleteDialog.userId && handleDelete(deleteDialog.userId)} className="rounded-lg">Delete</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
