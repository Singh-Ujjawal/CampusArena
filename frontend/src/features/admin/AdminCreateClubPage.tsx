import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { type Club, type Faculty, type SubClub } from '@/types';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Upload, X, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCreateClubPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // if id is present, we are in edit mode
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        imagePublicId: '',
        clubCoordinatorId: '',
        description: '',
        objective: '',
    });
    
    const [imagePreview, setImagePreview] = useState<string>('');
    
    // SubClubs state
    const [enableSubClubs, setEnableSubClubs] = useState(false);
    const [subClubGroupName, setSubClubGroupName] = useState('');
    const [subClubs, setSubClubs] = useState<SubClub[]>([]);

    useEffect(() => {
        fetchFaculties();
        if (id) {
            fetchClub(id);
        }
    }, [id]);

    const fetchFaculties = async () => {
        try {
            const response = await api.get('/api/faculty');
            setFaculties(response.data);
        } catch (error) {
            toast.error('Failed to load faculties');
        }
    };

    const fetchClub = async (clubId: string) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/api/clubs/${clubId}`);
            const club: Club = response.data;
            setFormData({
                name: club.name || '',
                image: club.image || '',
                imagePublicId: club.imagePublicId || '',
                clubCoordinatorId: club.clubCoordinatorId || '',
                description: club.description || '',
                objective: club.objective || '',
            });
            setImagePreview(club.image || '');
            
            if (club.subClubGroup) {
                setEnableSubClubs(true);
                setSubClubGroupName(club.subClubGroup.name || '');
                setSubClubs(club.subClubGroup.subClubs || []);
            }
        } catch (error) {
            toast.error('Failed to load club details');
            navigate('/admin/clubs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const result = await uploadToCloudinary(file);
            
            if (result.error) {
                toast.error(result.error);
                return;
            }

            setFormData(prev => ({ 
                ...prev, 
                image: result.secure_url,
                imagePublicId: result.public_id 
            }));
            setImagePreview(result.secure_url);
            toast.success('Logo uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const addSubClub = () => {
        setSubClubs([...subClubs, { name: '', clubCoordinatorId: '' }]);
    };

    const removeSubClub = (index: number) => {
        const newSubClubs = [...subClubs];
        newSubClubs.splice(index, 1);
        setSubClubs(newSubClubs);
    };

    const updateSubClub = (index: number, field: keyof SubClub, value: string) => {
        const newSubClubs = [...subClubs];
        newSubClubs[index] = { ...newSubClubs[index], [field]: value };
        setSubClubs(newSubClubs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error('Club name is required');
            return;
        }
        if (!formData.clubCoordinatorId) {
            toast.error('Please select a coordinator');
            return;
        }

        if (enableSubClubs) {
            if (!subClubGroupName) {
                toast.error('Sub Club Group Name is required when sub-clubs are enabled');
                return;
            }
            for (let i = 0; i < subClubs.length; i++) {
                if (!subClubs[i].name || !subClubs[i].clubCoordinatorId) {
                    toast.error(`Please complete all fields for sub-club #${i + 1}`);
                    return;
                }
            }
        }

        const payload: Partial<Club> = {
            ...formData,
        };

        if (enableSubClubs) {
            payload.subClubGroup = {
                name: subClubGroupName,
                subClubs: subClubs
            };
        } else {
            payload.subClubGroup = undefined;
        }

        setIsSubmitting(true);
        try {
            if (id) {
                await api.put(`/api/clubs/${id}`, payload);
                toast.success('Club updated successfully');
            } else {
                await api.post('/api/clubs', payload);
                toast.success('Club created successfully');
            }
            navigate('/admin/clubs');
        } catch (error: any) {
            toast.error(error.response?.data?.message || (id ? 'Failed to update club' : 'Failed to create club'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 px-2 pb-16">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/clubs')} className="rounded-full w-10 h-10 p-0 text-center flex items-center justify-center">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {id ? 'Edit Club' : 'Create New Club'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        {id ? 'Update the club details below.' : 'Fill in the information to setup a new club.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                
                {/* Basic Information */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Basic Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Club Name *</label>
                            <Input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter club name..."
                                className="h-14 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Coordinator *</label>
                            <Select
                                id="coordinator"
                                value={formData.clubCoordinatorId}
                                onChange={e => setFormData({ ...formData, clubCoordinatorId: e.target.value })}
                                options={faculties.map(faculty => ({
                                    value: faculty.id,
                                    label: `${faculty.firstName} ${faculty.lastName || ''}`
                                }))}
                                className="dark:bg-gray-800 dark:text-gray-100 h-14"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Provide a brief description of the club..."
                            className="min-h-[100px] w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-xl resize-y text-sm outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Objective (Optional)</label>
                        <textarea
                            value={formData.objective}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, objective: e.target.value })}
                            placeholder="What are the main objectives of this club?"
                            className="min-h-[100px] w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-xl resize-y text-sm outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Club Logo</label>
                        <div className="flex items-start gap-6">
                            <div className="flex-1">
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
                                    className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-indigo-500 transition-colors"
                                >
                                    {isUploadingImage ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                                            <span className="text-sm font-bold text-gray-500">Uploading...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload className="h-6 w-6 text-gray-400" />
                                            <span className="text-sm font-bold text-gray-500">
                                                {formData.image ? 'Change Image' : 'Click to Upload Logo'}
                                            </span>
                                        </div>
                                    )}
                                </label>
                            </div>
                            {(formData.image || imagePreview) && (
                                <div className="h-32 w-32 rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                                    <img src={imagePreview || formData.image} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sub-clubs section */}
                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sub-Clubs</h2>
                            <p className="text-xs text-gray-500">Enable if this club contains independent active sub-divisions.</p>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={enableSubClubs} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnableSubClubs(e.target.checked)} 
                            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                        />
                    </div>

                    <AnimatePresence>
                        {enableSubClubs && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-6 overflow-hidden"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Sub-Club Group Name *</label>
                                    <Input
                                        placeholder="e.g. Societies, Chapters, SIGs"
                                        value={subClubGroupName}
                                        onChange={e => setSubClubGroupName(e.target.value)}
                                        className="h-12 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-xl max-w-md"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Added Sub-Clubs</label>
                                    {subClubs.length === 0 && (
                                        <p className="text-sm text-gray-500 italic p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">No sub-clubs added yet.</p>
                                    )}
                                    {subClubs.map((sc, index) => (
                                        <div key={index} className="flex gap-4 items-end bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex-1 space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                                                <Input
                                                    placeholder="Sub-club name"
                                                    value={sc.name}
                                                    onChange={e => updateSubClub(index, 'name', e.target.value)}
                                                    className="h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Coordinator</label>
                                                <Select
                                                    id={`sc-coord-${index}`}
                                                    value={sc.clubCoordinatorId}
                                                    onChange={e => updateSubClub(index, 'clubCoordinatorId', e.target.value)}
                                                    options={faculties.map(faculty => ({
                                                        value: faculty.id,
                                                        label: `${faculty.firstName} ${faculty.lastName || ''}`
                                                    }))}
                                                    className="dark:bg-gray-900 dark:text-gray-100 h-10"
                                                />
                                            </div>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeSubClub(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0 w-10 h-10 p-0 text-center flex items-center justify-center">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={addSubClub} className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-indigo-600 dark:border-gray-700">
                                        <Plus className="mr-2 w-4 h-4" /> Add Sub-Club Entry
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate('/admin/clubs')}
                        className="h-12 px-6 rounded-xl font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-indigo-500/20"
                    >
                        {isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                        {id ? 'Save Changes' : 'Create Club'}
                    </Button>
                </div>

            </form>
        </div>
    );
}
