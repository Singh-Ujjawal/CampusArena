import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

interface FeedbackSubmission {
    id: string;
    formId: string;
    userId: string;
    username?: string;
    answers: Record<string, any>;
    submittedAt: string;
}

interface FeedbackResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    formId: string;
    formTitle: string;
    feedbackQuestions: any[];
}

export function FeedbackResultsModal({ isOpen, onClose, formId, formTitle, feedbackQuestions }: FeedbackResultsModalProps) {
    const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && formId) {
            fetchFeedback();
        }
    }, [isOpen, formId]);

    const fetchFeedback = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/api/feedback/${formId}/responses`);
            setSubmissions(response.data);
        } catch (error) {
            toast.error('Failed to load feedback results');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/20">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <MessageSquare className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{formTitle} - Feedback</h2>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{submissions.length} Submissions</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-10 w-10 p-0 hover:bg-white dark:hover:bg-gray-800">
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {isLoading ? (
                                <div className="py-20 text-center">
                                    <div className="animate-spin h-10 w-10 border-b-2 border-emerald-600 rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-500 font-medium">Loading feedback...</p>
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="py-20 text-center">
                                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No feedback submitted yet for this event.</p>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {feedbackQuestions && feedbackQuestions.length > 0 ? (
                                        feedbackQuestions.map((q: any) => (
                                            <div key={q.id} className="space-y-4">
                                                <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">
                                                    {q.label}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {submissions.map((sub, idx) => {
                                                        const ans = sub.answers[q.id];
                                                        if (ans === undefined || ans === null || ans === '') return null;
                                                        return (
                                                            <div key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all">
                                                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                                                                    <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                                                        <User className="h-3 w-3" />
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-gray-400 truncate flex-1">{sub.username || 'Anonymous'}</span>
                                                                    <span className="text-[8px] text-gray-400 font-medium">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                                    {Array.isArray(ans) ? ans.join(', ') : String(ans)}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <p className="text-gray-500 font-medium italic">No specific feedback questions defined for this form.</p>
                                            <p className="text-xs text-gray-400 mt-2">However, {submissions.length} submissions were found.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
