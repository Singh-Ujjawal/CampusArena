import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Club, type Faculty } from '@/types';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
    Plus, Trash2, Edit, Search, Building2,
    User as UserIcon, X, Loader2, Sparkles,
    Shield, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminClubsPageSkeleton } from '@/components/skeleton';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { DeleteButton } from '@/components/DeleteButton';
import { uploadToCloudinary } from '@/utils/cloudinary';

export default function AdminClubsPage() {
    const navigate = useNavigate();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [clubToDelete, setClubToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchClubs();
        fetchFaculties();
    }, []);

    const fetchClubs = async () => {
        try {
            const response = await api.get('/api/clubs');
            setClubs(response.data);
        } catch (error) {
            toast.error('Failed to load clubs');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFaculties = async () => {
        try {
            const response = await api.get('/api/faculty');
            setFaculties(response.data);
        } catch (error) {
            toast.error('Failed to load faculties');
        }
    };


    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/api/clubs/${id}`);
            toast.success('Club deleted successfully');
            fetchClubs();
        } catch (error) {
            toast.error('Failed to delete club');
        }
    };

    const handleEdit = (club: Club) => {
        navigate(`/admin/clubs/edit/${club.id}`);
    };

    const filteredClubs = clubs.filter(club => {
        const coordinatorName = faculties.find(f => f.id === club.clubCoordinatorId)?.firstName || '';
        return club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coordinatorName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="w-full space-y-8">
            <div className="w-full space-y-10 px-2">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight italic">
                            Club Management
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl font-medium">
                            Organize and oversee campus clubs and coordinators.
                        </p>
                    </div>

                    <Button
                        onClick={() => navigate('/admin/clubs/create')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6 text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Club
                    </Button>
                </div>

                {/* Stats/Search Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search clubs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-11 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                        <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-bold text-gray-700 dark:text-white">{clubs.length} Clubs</span>
                    </div>
                </div>

                {/* Clubs List */}
                {isLoading ? (
                    <AdminClubsPageSkeleton />
                ) : filteredClubs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence mode='popLayout'>
                            {filteredClubs.map((club, idx) => (
                                <motion.div
                                    key={club.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                                    className="flex flex-col p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 flex-shrink-0 shadow-inner">
                                            {club.image ? (
                                                <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate px-1">
                                                {club.name}
                                            </h3>
                                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-black uppercase tracking-tight">
                                                Active Unit
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="h-7 w-7 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 flex-shrink-0">
                                                <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
                                                {faculties.find(f => f.id === club.clubCoordinatorId)?.firstName || 'Unassigned'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 translate-x-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(club)}
                                                className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <DeleteButton
                                                onClick={() => setClubToDelete(club.id)}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                        <div className="h-24 w-24 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-6">
                            <Search className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">No Clubs Found</h3>
                        <p className="text-gray-500 mt-2 font-medium">Try adjusting your search or add a new club entity.</p>
                    </div>
                )}


            </div>

            <DeleteConfirmDialog
                isOpen={!!clubToDelete}
                onClose={() => setClubToDelete(null)}
                onConfirm={() => clubToDelete && handleDelete(clubToDelete)}
                title={clubs.find(c => c.id === clubToDelete)?.name || ''}
                itemType="Club"
            />
        </div>
    );
}
