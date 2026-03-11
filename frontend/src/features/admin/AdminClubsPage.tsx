import { useEffect, useState } from 'react';
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

export default function AdminClubsPage() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClub, setEditingClub] = useState<Club | null>(null);
    const [clubToDelete, setClubToDelete] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        clubCoordinatorId: ''
    });
    const [imagePreview, setImagePreview] = useState<string>('');

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setIsUploadingImage(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const response = await api.post('/api/upload', formDataUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.path) {
                setFormData(prev => ({ ...prev, image: response.data.path }));
                setImagePreview(response.data.path);
                toast.success('Image uploaded successfully');
            }
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingClub) {
                await api.put(`/api/clubs/${editingClub.id}`, formData);
                toast.success('Club updated successfully');
            } else {
                await api.post('/api/clubs', formData);
                toast.success('Club created successfully');
            }
            fetchClubs();
            handleCloseModal();
        } catch (error) {
            toast.error(editingClub ? 'Failed to update club' : 'Failed to create club');
        } finally {
            setIsSubmitting(false);
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
        setEditingClub(club);
        setFormData({
            name: club.name,
            image: club.image,
            clubCoordinatorId: club.clubCoordinatorId
        });
        setImagePreview(club.image);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClub(null);
        setFormData({ name: '', image: '', clubCoordinatorId: '' });
        setImagePreview('');
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
                        onClick={() => setIsModalOpen(true)}
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

                {/* Create/Edit Modal */}
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
                                className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800"
                            >
                                <div className="p-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                                            {editingClub ? 'Update' : 'Create'} <span className="text-indigo-600">Club</span>
                                        </h2>
                                        <button onClick={handleCloseModal} className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Club Name</label>
                                                <Input
                                                    required
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Enter club name..."
                                                    className="h-16 px-6 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-lg font-bold transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Club Image</label>
                                                <div className="space-y-3">
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            disabled={isUploadingImage}
                                                            className="hidden"
                                                            id="image-upload"
                                                        />
                                                        <label
                                                            htmlFor="image-upload"
                                                            className="flex items-center justify-center h-16 px-6 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-indigo-500 transition-colors"
                                                        >
                                                            {isUploadingImage ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Uploading...</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <Upload className="h-5 w-5 text-gray-400" />
                                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                                        {formData.image ? 'Change Image' : 'Select Image'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </label>
                                                    </div>
                                                    {(formData.image || imagePreview) && (
                                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Preview</p>
                                                            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-900">
                                                                <img 
                                                                    src={imagePreview || formData.image} 
                                                                    alt="Preview" 
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            {formData.image && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                                                                    {formData.image}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Club Coordinator</label>
                                                <Select
                                                    id="coordinator"
                                                    value={formData.clubCoordinatorId}
                                                    onChange={e => setFormData({ ...formData, clubCoordinatorId: e.target.value })}
                                                    options={faculties.map(faculty => ({
                                                        value: faculty.id,
                                                        label: `${faculty.firstName} ${faculty.lastName || ''}`
                                                    }))}
                                                    className="dark:bg-gray-900 dark:text-gray-100"
                                                    style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={handleCloseModal}
                                                className="flex-1 h-16 rounded-2xl text-lg font-black"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-16 px-10 text-lg font-black shadow-xl shadow-indigo-500/20 disabled:grayscale transition-all"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin" /> : editingClub ? 'Save Changes' : 'Create Club'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
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
