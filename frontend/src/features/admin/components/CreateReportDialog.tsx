import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X, FileText, Send, Image as ImageIcon, Plus, Loader2, Trash2 } from 'lucide-react';
import { uploadToCloudinary } from '@/utils/cloudinary';

interface CreateReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    eventType: 'QUIZ' | 'CONTEST' | 'REGISTRATION';
    eventTitle: string;
    initialObjective?: string;
    initialImpactAnalysis?: string;
    initialSocialLinks?: string[];
    initialPhotographs?: string[];
    initialPhotoPublicIds?: string[];
    reportId?: string;
    onSuccess?: (reportId: string) => void;
}

const EMPTY_ARRAY: string[] = [];

export function CreateReportDialog({ 
    isOpen, 
    onClose, 
    eventId, 
    eventType, 
    eventTitle,
    initialObjective = '',
    initialImpactAnalysis = '',
    initialSocialLinks = EMPTY_ARRAY,
    initialPhotographs = EMPTY_ARRAY,
    initialPhotoPublicIds = EMPTY_ARRAY,
    reportId,
    onSuccess
}: CreateReportDialogProps) {
    const navigate = useNavigate();
    const [objective, setObjective] = useState<string>(typeof initialObjective === 'string' ? initialObjective : '');
    const [impactAnalysis, setImpactAnalysis] = useState<string>(typeof initialImpactAnalysis === 'string' ? initialImpactAnalysis : '');
    const [socialLinks, setSocialLinks] = useState<string[]>(Array.isArray(initialSocialLinks) ? initialSocialLinks : EMPTY_ARRAY);
    const [photographs, setPhotographs] = useState<string[]>(Array.isArray(initialPhotographs) ? initialPhotographs : EMPTY_ARRAY);
    const [photoPublicIds, setPhotoPublicIds] = useState<string[]>(Array.isArray(initialPhotoPublicIds) ? initialPhotoPublicIds : EMPTY_ARRAY);
    
    const [linkInput, setLinkInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Update state when modal opens or initial props change
    useEffect(() => {
        if (isOpen) {
            setObjective(typeof initialObjective === 'string' ? initialObjective : '');
            setImpactAnalysis(typeof initialImpactAnalysis === 'string' ? initialImpactAnalysis : '');
            setSocialLinks(Array.isArray(initialSocialLinks) ? initialSocialLinks : EMPTY_ARRAY);
            setPhotographs(Array.isArray(initialPhotographs) ? initialPhotographs : EMPTY_ARRAY);
            setPhotoPublicIds(Array.isArray(initialPhotoPublicIds) ? initialPhotoPublicIds : EMPTY_ARRAY);
        }
    }, [isOpen, initialObjective, initialImpactAnalysis, initialSocialLinks, initialPhotographs, initialPhotoPublicIds]);

    const addLink = () => {
        if (linkInput.trim() && !socialLinks.includes(linkInput.trim())) {
            setSocialLinks([...socialLinks, linkInput.trim()]);
            setLinkInput('');
        }
    };

    const removeLink = (link: string) => {
        setSocialLinks(socialLinks.filter(l => l !== link));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newPhotos = [...photographs];
        const newIds = [...photoPublicIds];

        try {
            for (let i = 0; i < files.length; i++) {
                const result = await uploadToCloudinary(files[i]);
                if (result.secure_url) {
                    newPhotos.push(result.secure_url);
                    newIds.push(result.public_id);
                }
            }
            setPhotographs(newPhotos);
            setPhotoPublicIds(newIds);
            toast.success(`${files.length} photos uploaded successfully`);
        } catch (error) {
            toast.error('Failed to upload some photos');
            console.error(error);
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const removePhoto = (index: number) => {
        setPhotographs(photographs.filter((_, i) => i !== index));
        setPhotoPublicIds(photoPublicIds.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!objective.trim()) {
            toast.error('Objective is required');
            return;
        }

        if (!eventId) {
            toast.error('Event ID is missing');
            return;
        }

        setIsSubmitting(true);
        try {
            const cleanedSocialLinks = Array.isArray(socialLinks) 
                ? socialLinks
                    .filter(l => l && typeof l === 'string' && l.trim().length > 0)
                    .map(l => l.trim())
                : [];

            const payload = {
                id: reportId,
                eventId: String(eventId).trim(),
                eventType: String(eventType).trim().toUpperCase(),
                objective: objective.trim(),
                impactAnalysis: impactAnalysis.trim(),
                photographs: photographs,
                photoPublicIds: photoPublicIds,
                socialMediaLinks: cleanedSocialLinks.length > 0 ? cleanedSocialLinks : undefined
            };

            const response = await api.post('/api/reports/generate', payload);

            toast.success('Report generated successfully!');
            onClose();
            if (onSuccess) {
                onSuccess(response.data.id);
            } else {
                navigate(`/admin/reports/${response.data.id}`);
            }
        } catch (error) {
            toast.error('Failed to generate report');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg overflow-hidden flex flex-col"
                    >
                        <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative flex-shrink-0">
                            <button 
                                onClick={onClose}
                                className="absolute right-4 top-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <FileText className="h-6 w-6" />
                                {reportId ? 'Regenerate Event Report' : 'Generate Event Report'}
                            </h2>
                            <p className="text-indigo-100 text-sm mt-1 opacity-90">
                                {reportId ? 'Updating' : 'Creating'} Report for: <span className="font-semibold">{eventTitle}</span>
                            </p>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                        Objective <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="What was the goal of this event?"
                                        value={objective}
                                        onChange={(e) => setObjective(e.target.value)}
                                        className="w-full min-h-[100px] p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                        Impact Analysis <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                                    </label>
                                    <textarea
                                        placeholder="Describe the impact and outcome of this event..."
                                        value={impactAnalysis}
                                        onChange={(e) => setImpactAnalysis(e.target.value)}
                                        className="w-full min-h-[100px] p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                        Event Photographs <span className="text-gray-400 font-normal normal-case">(Add multiple)</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {photographs.map((photo, index) => (
                                            <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50">
                                                <img src={photo} alt="" className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={() => removePhoto(index)}
                                                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <label className={`
                                            flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed 
                                            transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50
                                            ${isUploading ? 'border-indigo-400 bg-indigo-50/10' : 'border-gray-200 dark:border-gray-700'}
                                        `}>
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={handlePhotoUpload}
                                                disabled={isUploading}
                                            />
                                            {isUploading ? (
                                                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                                            ) : (
                                                <>
                                                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-full mb-1">
                                                        <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Add Photo</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                        Social Media Links <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add link..."
                                            value={linkInput}
                                            onChange={(e) => setLinkInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addLink()}
                                            className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl"
                                        />
                                        <Button onClick={addLink} variant="outline" className="rounded-xl px-4 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                            Add
                                        </Button>
                                    </div>
                                    
                                    {socialLinks && socialLinks.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {socialLinks.map((link) => (
                                                <div key={link} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800">
                                                    <span className="truncate max-w-[200px]">{link}</span>
                                                    <button onClick={() => removeLink(link)} className="hover:text-red-500 transition-colors">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-3 flex-shrink-0">
                            <Button 
                                variant="outline" 
                                onClick={onClose}
                                className="flex-1 h-12 rounded-xl font-bold border-gray-200 dark:border-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || isUploading}
                                className="flex-1 h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none text-white"
                            >
                                {isSubmitting ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        {reportId ? 'Regenerate' : 'Generate'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
