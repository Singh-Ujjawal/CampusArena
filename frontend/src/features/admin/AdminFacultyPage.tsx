import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Faculty } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Trash2, Search, UserCheck,
    Mail, X, Loader2,
    Shield, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminFacultyPageSkeleton } from '@/components/skeleton';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { DeleteButton } from '@/components/DeleteButton';

export default function AdminFacultyPage() {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [facultyToDelete, setFacultyToDelete] = useState<string | null>(null);

    // Form states for creation
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        course: 'BTECH' // Default course
    });

    useEffect(() => {
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            const response = await api.get('/admin/getAllFaculties');
            setFaculties(response.data);
        } catch (error) {
            toast.error('Failed to load faculties');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/admin/insertFaculty', formData);
            toast.success('Faculty account created successfully');
            fetchFaculties();
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create faculty');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/admin/${id}`);
            toast.success('Faculty member deleted');
            fetchFaculties();
        } catch (error) {
            toast.error('Failed to delete faculty');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            username: '',
            password: '',
            email: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            course: 'BTECH'
        });
    };

    const filteredFaculties = faculties.filter(f =>
        `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 w-full max-w-[1600px] mx-auto">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        Faculty Personnel
                    </h1>
                    <p className="text-gray-500 dark:text-gray-300 mt-2 text-sm sm:text-base font-medium">Onboard and manage faculty coordinators who will oversee events and contests.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="relative w-full sm:w-80 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search faculty..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-12 bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-xl text-gray-900 dark:text-gray-100 font-bold w-full"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 text-base font-black shadow-lg shadow-blue-500/20 transition-all w-full sm:w-auto shrink-0"
                    >
                        <UserPlus className="mr-2 h-5 w-5" /> Add Faculty
                    </Button>
                </div>
            </div>

            {/* Faculty List */}
            {isLoading ? (
                <AdminFacultyPageSkeleton />
            ) : filteredFaculties.length > 0 ? (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
                        <div className="overflow-x-auto">
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
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    <AnimatePresence mode='popLayout'>
                                        {filteredFaculties.map((faculty, idx) => (
                                            <motion.tr
                                                key={faculty.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2, delay: idx * 0.02 }}
                                                className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group"
                                            >
                                                <td className="px-6 py-3">
                                                    <Link to={`/admin/users/${faculty.id}`} className="flex items-center gap-3 group/link">
                                                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover/link:bg-blue-600 group-hover/link:text-white transition-all shadow-sm">
                                                            <UserCheck className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-black text-gray-900 dark:text-white leading-none group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors">
                                                                {faculty.firstName} {faculty.lastName}
                                                            </p>
                                                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5">
                                                                @{faculty.username}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-bold text-xs">
                                                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                        {faculty.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-gray-600 dark:text-gray-400 font-bold text-xs">
                                                    {faculty.phoneNumber || '—'}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                                        {faculty.course}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex justify-end">
                                                        <DeleteButton
                                                            onClick={() => setFacultyToDelete(faculty.id)}
                                                            title="Delete Faculty"
                                                        />
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden grid grid-cols-1 gap-4">
                        <AnimatePresence mode='popLayout'>
                            {filteredFaculties.map((faculty, idx) => (
                                <motion.div
                                    key={faculty.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                                    className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <Link to={`/admin/users/${faculty.id}`} className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                                                <UserCheck className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                                                    {faculty.firstName} {faculty.lastName}
                                                </h3>
                                                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                                    @{faculty.username}
                                                </p>
                                            </div>
                                        </Link>
                                        <span className="px-3 py-1 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-gray-100 dark:border-gray-800">
                                            {faculty.course}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-2 pt-2">
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                                            <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <span className="truncate">{faculty.email}</span>
                                        </div>
                                        {faculty.phoneNumber && (
                                            <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                                                <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-black">TEL</span>
                                                </div>
                                                <span>{faculty.phoneNumber}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end pt-2">
                                        <DeleteButton
                                            onClick={() => setFacultyToDelete(faculty.id)}
                                            variant="full"
                                            label="Delete Account"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            ) : (
                <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <div className="h-24 w-24 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mx-auto mb-6">
                        <Search className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">No Personnel Found</h3>
                    <p className="text-gray-500 font-medium mt-2">Try adjusting your search terms</p>
                </div>
            )}

                {/* Create Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleCloseModal}
                                className="absolute inset-0 bg-[#0B0F1A]/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                            >
                                <div className="p-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                                            Register <span className="text-blue-600">Faculty</span>
                                        </h2>
                                        <button onClick={handleCloseModal} className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">First Name</label>
                                                <Input
                                                    required
                                                    value={formData.firstName}
                                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                    placeholder="John"
                                                    className="h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Last Name</label>
                                                <Input
                                                    required
                                                    value={formData.lastName}
                                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                                    placeholder="Doe"
                                                    className="h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Username</label>
                                                <Input
                                                    required
                                                    value={formData.username}
                                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                                    placeholder="johndoe_faculty"
                                                    className="h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Password</label>
                                                <Input
                                                    required
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                                                <Input
                                                    required
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="faculty@college.edu"
                                                    className="h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
                                                <Input
                                                    required
                                                    value={formData.phoneNumber}
                                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                    placeholder="10 digit number"
                                                    className="h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Course/Department</label>
                                                <select
                                                    required
                                                    value={formData.course}
                                                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                                                    className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold px-6 outline-none"
                                                >
                                                    <option value="BTECH">B.Tech</option>
                                                    <option value="BCA">BCA</option>
                                                    <option value="BBA">BBA</option>
                                                    <option value="BCOM">B.Com</option>
                                                    <option value="MBA">MBA</option>
                                                    <option value="DIPLOMA">Diploma</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={handleCloseModal}
                                                className="flex-1 h-14 rounded-2xl font-black"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-10 font-black shadow-xl shadow-blue-500/20"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Register Faculty'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            <DeleteConfirmDialog
                isOpen={!!facultyToDelete}
                onClose={() => setFacultyToDelete(null)}
                onConfirm={() => facultyToDelete && handleDelete(facultyToDelete)}
                title={faculties.find(f => f.id === facultyToDelete) ? `${faculties.find(f => f.id === facultyToDelete)?.firstName} ${faculties.find(f => f.id === facultyToDelete)?.lastName}` : ''}
                itemType="Faculty"
            />
        </div>
    );
}
