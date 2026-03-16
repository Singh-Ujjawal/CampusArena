import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X, FileText, Send } from 'lucide-react';

interface CreateReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    eventType: 'QUIZ' | 'CONTEST' | 'REGISTRATION';
    eventTitle: string;
}

export function CreateReportDialog({ isOpen, onClose, eventId, eventType, eventTitle }: CreateReportDialogProps) {
    const navigate = useNavigate();
    const [venue, setVenue] = useState('');
    const [objective, setObjective] = useState('');
    const [socialLinks, setSocialLinks] = useState<string[]>([]);
    const [linkInput, setLinkInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addLink = () => {
        if (linkInput.trim() && !socialLinks.includes(linkInput.trim())) {
            setSocialLinks([...socialLinks, linkInput.trim()]);
            setLinkInput('');
        }
    };

    const removeLink = (link: string) => {
        setSocialLinks(socialLinks.filter(l => l !== link));
    };

    const handleSubmit = async () => {
        if (!objective.trim()) {
            toast.error('Objective is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post('/api/reports/generate', {
                eventId,
                eventType,
                venue: venue.trim() || undefined,
                objective: objective.trim(),
                socialMediaLinks: socialLinks.length > 0 ? socialLinks : undefined,
            });

            toast.success('Report generated successfully!');
            onClose();
            navigate(`/admin/reports/${response.data.id}`);
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
                        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg overflow-hidden"
                    >
                        <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative">
                            <button 
                                onClick={onClose}
                                className="absolute right-4 top-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <FileText className="h-6 w-6" />
                                Generate Event Report
                            </h2>
                            <p className="text-indigo-100 text-sm mt-1 opacity-90">
                                For: <span className="font-semibold">{eventTitle}</span>
                            </p>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                        Venue <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                                    </label>
                                    <Input
                                        placeholder="e.g. Auditorium, Lab 1, Zoom"
                                        value={venue}
                                        onChange={(e) => setVenue(e.target.value)}
                                        className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl h-12"
                                    />
                                </div>

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
                                    
                                    {socialLinks.length > 0 && (
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

                            <div className="flex gap-3 pt-4 bg-white dark:bg-gray-800 sticky bottom-0">
                                <Button 
                                    variant="outline" 
                                    onClick={onClose}
                                    className="flex-1 h-12 rounded-xl font-bold border-gray-200 dark:border-gray-700"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none text-white"
                                >
                                    {isSubmitting ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Generate
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
