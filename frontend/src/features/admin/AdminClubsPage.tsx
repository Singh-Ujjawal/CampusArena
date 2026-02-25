import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { type Club, type Faculty } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import {
    Plus, Trash2, Edit, Search, Building2,
    User as UserIcon, X, Loader2, Sparkles,
    Shield, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminClubsPage() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClub, setEditingClub] = useState<Club | null>(null);

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
        if (!window.confirm('Are you sure you want to delete this club?')) return;
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
        <div className="min-h-screen bg-gray-50/30 dark:bg-[#0B0F1A] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                            <Shield className="h-4 w-4" /> Administration
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                            Club <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Management</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl font-medium leading-relaxed">
                            Organize and oversee campus clubs, assign coordinators, and manage departmental identities.
                        </p>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-16 px-8 text-lg font-black shadow-2xl shadow-indigo-500/20 transition-all"
                        >
                            <Plus className="mr-2 h-6 w-6" /> Add New Club
                        </Button>
                    </motion.div>
                </div>

                {/* Stats/Search Bar */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative flex-1 w-full group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search clubs by name or faculty coordinator..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-14 h-16 bg-white dark:bg-gray-800/50 border-none shadow-xl shadow-gray-200/50 dark:shadow-none rounded-3xl text-lg font-bold focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
                        />
                    </div>
                    <div className="px-8 py-4 bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Clubs</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{clubs.length}</p>
                        </div>
                    </div>
                </div>

                {/* Clubs Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-gray-800/20 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                        <p className="mt-4 text-gray-500 font-black uppercase tracking-widest text-sm">Synchronizing Clubs...</p>
                    </div>
                ) : filteredClubs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode='popLayout'>
                            {filteredClubs.map((club, idx) => (
                                <motion.div
                                    key={club.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                >
                                    <Card className="group relative overflow-hidden border-none shadow-xl hover:shadow-2xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-800 rounded-[2.5rem] transition-all duration-300">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <CardContent className="p-8">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                                                    {club.image ? (
                                                        <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                                    )}
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(club)}
                                                        className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 p-0"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(club.id)}
                                                        className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 p-0"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                                    {club.name}
                                                </h3>
                                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coordinator</p>
                                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            {faculties.find(f => f.id === club.clubCoordinatorId)?.firstName || 'Unknown'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {club.image && (
                                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Club Image</p>
                                                        <img src={club.image} alt={club.name} className="w-full h-32 object-cover rounded-lg" />
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 text-center">
                        <div className="h-24 w-24 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-6">
                            <Search className="h-12 w-12 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">No Clubs Found</h3>
                        <p className="text-gray-500 mt-2 font-medium">Try adjusting your search or add a new club.</p>
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
        </div>
    );
}
