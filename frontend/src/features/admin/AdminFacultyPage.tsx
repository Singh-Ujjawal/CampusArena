import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { type Faculty } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Trash2, Search, UserCheck,
    Mail, Phone, BookOpen, X, Loader2,
    Shield, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminFacultyPage() {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        if (!window.confirm('Are you sure you want to delete this faculty member? This will remove their account entirely.')) return;
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
        <div className="min-h-screen bg-gray-50/30 dark:bg-[#0B0F1A] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                            <Shield className="h-4 w-4" /> Administration
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                            Faculty <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Personnel</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl font-medium leading-relaxed">
                            Onboard and manage faculty coordinators who will oversee events, contests, and student activities.
                        </p>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-16 px-8 text-lg font-black shadow-2xl shadow-blue-500/20 transition-all"
                        >
                            <UserPlus className="mr-2 h-6 w-6" /> Add Faculty
                        </Button>
                    </motion.div>
                </div>

                {/* Search Bar */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative flex-1 w-full group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search by name, username or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-14 h-16 bg-white dark:bg-gray-800/50 border-none shadow-xl shadow-gray-200/50 dark:shadow-none rounded-3xl text-lg font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Cards Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                        <p className="mt-4 text-gray-500 font-black tracking-widest text-sm">LOADING FACULTY DATA...</p>
                    </div>
                ) : filteredFaculties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode='popLayout'>
                            {filteredFaculties.map((faculty, idx) => (
                                <motion.div
                                    key={faculty.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                >
                                    <Card className="group relative overflow-hidden border-none shadow-xl hover:shadow-2xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-800 rounded-[2.5rem] transition-all duration-300">
                                        <CardContent className="p-0">
                                            <div className="h-3 bg-blue-600"></div>
                                            <div className="p-8">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center">
                                                        <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(faculty.id)}
                                                        className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 p-0 transition-opacity opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>

                                                <div className="space-y-6">
                                                    <div>
                                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white truncate">
                                                            {faculty.firstName} {faculty.lastName}
                                                        </h3>
                                                        <p className="text-blue-600 dark:text-blue-400 text-sm font-black uppercase tracking-widest mt-1">@{faculty.username}</p>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                            <Mail className="h-4 w-4" />
                                                            <span className="text-sm font-bold truncate">{faculty.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                            <Phone className="h-4 w-4" />
                                                            <span className="text-sm font-bold">{faculty.phoneNumber || 'No Phone'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                            <BookOpen className="h-4 w-4" />
                                                            <span className="text-sm font-black uppercase tracking-tighter bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg">{faculty.course}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                            <Search className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Faculty Found</h3>
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
            </div>
        </div>
    );
}
