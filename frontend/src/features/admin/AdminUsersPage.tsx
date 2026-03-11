import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type User } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash, Search, User as UserIcon, Mail, Hash, X, ChevronDown, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { AdminUsersPageSkeleton } from '@/components/skeleton';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { DeleteButton } from '@/components/DeleteButton';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({ open: false, userId: null });
    
    // Filtering state
    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const [selectedSection, setSelectedSection] = useState<string>('all');

    const fetchUsers = useCallback(async (query = '') => {
        try {
            const response = await api.get(query ? `/user/search?query=${query}` : '/user');
            // Initial sort by roll number
            const sortedData = [...response.data].sort((a, b) => 
                (a.rollNumber || '').localeCompare(b.rollNumber || '', undefined, { numeric: true, sensitivity: 'base' })
            );
            setUsers(sortedData);
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

    // Derived data for filters
    const standardCourses = ['B.Tech', 'BCA', 'BBA', 'B.Com', 'MBA'];
    const uniqueUserCourses = Array.from(new Set(users.map(u => u.course))).filter(Boolean);
    const courses = Array.from(new Set([...standardCourses, ...uniqueUserCourses])).sort();
    
    // Robust detection for B.Tech (ignores dots, spaces, case)
    const isBTech = (c: string) => {
        if (!c || c === 'all') return false;
        const normalized = c.toLowerCase().replace(/[\s.]/g, '');
        return normalized === 'btech';
    };

    const branches = Array.from(new Set(users.filter(u => u.course === selectedCourse).map(u => u.branch))).filter(Boolean).sort();
    const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    const getCourseCount = (course: string) => users.filter(u => u.course === course).length;
    const getBranchCount = (branch: string) => users.filter(u => u.course === selectedCourse && u.branch === branch).length;
    const getSectionCount = (section: string) => users.filter(u => 
        u.course === selectedCourse && 
        (selectedBranch === 'all' || u.branch === selectedBranch) && 
        u.section === section
    ).length;

    const handleCourseChange = (course: string) => {
        setSelectedCourse(course);
        setSelectedBranch('all');
        setSelectedSection('all');
    };

    const filteredUsers = users.filter(user => {
        const matchesCourse = selectedCourse === 'all' || user.course === selectedCourse;
        
        // Branch and Section filters only apply to B.Tech
        if (isBTech(selectedCourse)) {
            const matchesBranch = selectedBranch === 'all' || user.branch === selectedBranch;
            const matchesSection = selectedSection === 'all' || user.section === selectedSection;
            return matchesCourse && matchesBranch && matchesSection;
        }

        return matchesCourse;
    });

    return (
        <div className="space-y-8 p-6 w-full">
            <div className="flex flex-col gap-6">
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

                {/* Filter Bar */}
                <div className="bg-gray-50 dark:bg-gray-800/40 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => { setSelectedCourse('all'); setSelectedBranch('all'); setSelectedSection('all'); }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            selectedCourse === 'all' 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                            : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        All <span className={`px-1.5 py-0.5 rounded-lg text-[10px] ${selectedCourse === 'all' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>{users.length}</span>
                    </button>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

                    <div className="relative flex items-center">
                        <Filter className="absolute left-3 h-4 w-4 text-gray-400" />
                        <select
                            value={selectedCourse}
                            onChange={(e) => handleCourseChange(e.target.value)}
                            className="pl-9 pr-8 h-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        >
                            <option value="all">Course (All)</option>
                            {courses.map(course => (
                                <option key={course} value={course}>{course} ({getCourseCount(course)})</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {isBTech(selectedCourse) && (
                        <>
                            <div className="relative flex items-center">
                                <select
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="pl-4 pr-9 h-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                                >
                                    <option value="all">Branch (All)</option>
                                    {branches.map(branch => (
                                        <option key={branch} value={branch}>{branch} ({getBranchCount(branch)})</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>

                            <div className="relative flex items-center">
                                <select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    className="pl-4 pr-9 h-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                                >
                                    <option value="all">Section (All)</option>
                                    {sections.map(sec => (
                                        <option key={sec} value={sec}>Section {sec} ({getSectionCount(sec)})</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isLoading && users.length === 0 ? (
                <AdminUsersPageSkeleton />
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
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
                                {filteredUsers.map(user => (
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
                                                {user.section && (
                                                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded text-[11px] font-bold border border-emerald-100 dark:border-emerald-800">
                                                        Sec {user.section}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end">
                                                <DeleteButton
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setDeleteDialog({ open: true, userId: user.id });
                                                    }}
                                                    title="Delete User"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="md:hidden grid grid-cols-1 gap-4">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <Link to={`/admin/users/${user.id}`} className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                            <UserIcon className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                                        </div>
                                    </Link>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter shrink-0 ${
                                        user.role === 'ADMIN' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                    }`}>
                                        {user.role}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                        <Hash className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">Roll: {user.rollNumber || '—'}</span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold border border-blue-100 dark:border-blue-800">
                                            {user.course}
                                        </span>
                                        {user.branch && (
                                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold border border-indigo-100 dark:border-indigo-800">
                                                {user.branch}
                                            </span>
                                        )}
                                        {user.section && (
                                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold border border-emerald-100 dark:border-emerald-800">
                                                Sec {user.section}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <DeleteButton
                                        onClick={() => setDeleteDialog({ open: true, userId: user.id })}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {!isLoading && users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-500">
                    <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-300 font-medium">No users found matching "{searchQuery}"</p>
                    <Button variant="ghost" onClick={clearSearch} className="mt-2 text-blue-600 dark:text-blue-400 hover:bg-transparent">Clear Search</Button>
                </div>
            )}

            <DeleteConfirmDialog
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, userId: null })}
                onConfirm={() => deleteDialog.userId && handleDelete(deleteDialog.userId)}
                title={users.find(u => u.id === deleteDialog.userId) ? `${users.find(u => u.id === deleteDialog.userId)?.firstName} ${users.find(u => u.id === deleteDialog.userId)?.lastName}` : ''}
                itemType="User"
            />
        </div>
    );
}
