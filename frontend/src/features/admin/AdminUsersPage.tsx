import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash, Search, User as UserIcon, Mail, Hash, BookOpen, GraduationCap, X } from 'lucide-react';
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => (
                        <div key={user.id} className="group h-full flex flex-col">
                            <Link to={`/admin/users/${user.id}`} className="block h-full flex-1">
                                <Card className="overflow-hidden border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-white dark:bg-gray-900 h-full group-hover:ring-2 group-hover:ring-blue-500/50 flex flex-col">
                                    <CardContent className="p-0 h-full flex flex-col flex-1">
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                                        <UserIcon className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg leading-tight truncate max-w-[180px]">
                                                            {user.firstName} {user.lastName}
                                                        </h3>
                                                        <p className="text-blue-100 text-xs font-medium">@{user.username}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-yellow-400 text-yellow-900' : 'bg-green-400 text-green-900'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5 space-y-4 flex-grow">
                                            <div className="grid grid-cols-1 gap-y-3">
                                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm truncate" title={user.email}>{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                                    <Hash className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium">{user.rollNumber || 'No Roll No.'}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-500">
                                                        <GraduationCap className="h-3 w-3 text-blue-500" />
                                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{user.course}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-500">
                                                        <BookOpen className="h-3 w-3 text-indigo-500" />
                                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{user.branch}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                className="rounded-xl"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setDeleteDialog({ open: true, userId: user.id });
                                                }}
                                            >
                                                <Trash className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    ))}
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
