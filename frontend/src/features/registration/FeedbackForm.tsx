'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Loader2, CheckCircle2, X } from 'lucide-react';

interface FeedbackFormProps {
    formId: string;
    onClose?: () => void;
    onSuccess?: () => void;
}

export default function FeedbackForm({ formId, onClose, onSuccess }: FeedbackFormProps) {
    const [form, setForm] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const response = await api.get(`/api/registration/forms/${formId}`);
                setForm(response.data);
                
                if (!response.data.feedbackEnabled) {
                    onClose?.();
                    return;
                }

                // Check if already submitted
                const statusRes = await api.get(`/api/feedback/${formId}/status`);
                if (statusRes.data) {
                    setIsSubmitted(true);
                }

                // Initialize answers
                const initialAnswers: Record<string, any> = {};
                response.data.feedbackQuestions?.forEach((q: any) => {
                    if (q.type === 'CHECKBOX') initialAnswers[q.id] = [];
                    else initialAnswers[q.id] = '';
                });
                setAnswers(initialAnswers);
            } catch (error) {
                console.error('Failed to fetch feedback form', error);
                onClose?.();
            } finally {
                setIsLoading(false);
            }
        };

        fetchForm();
    }, [formId]);

    const handleInputChange = (qId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleCheckboxChange = (qId: string, option: string, checked: boolean) => {
        const current = answers[qId] || [];
        if (checked) {
            handleInputChange(qId, [...current, option]);
        } else {
            handleInputChange(qId, current.filter((o: string) => o !== option));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await api.post(`/api/feedback/${formId}/submit`, answers);
            setIsSubmitted(true);
            toast.success('Feedback submitted successfully!');
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return null;

    if (isSubmitted) {
        return (
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Your feedback has been recorded.</p>
                </CardContent>
            </Card>
        );
    }

    if (!form || !form.feedbackQuestions || form.feedbackQuestions.length === 0) return null;

    return (
        <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden max-w-2xl w-full mx-auto">
            <CardHeader className="bg-indigo-600 p-6 text-white relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                    <MessageSquare className="h-6 w-6" />
                    Event Feedback
                </CardTitle>
                <p className="text-indigo-100 text-sm mt-1">Help us improve by sharing your experience</p>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
                    {form.feedbackQuestions.map((q: any, idx: number) => (
                        <div key={q.id} className="space-y-4">
                            <label className="text-base font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                                {idx + 1}. {q.label}
                                {q.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            <div className="pl-2">
                                {q.type === 'TEXT' && (
                                    <textarea
                                        required={q.required}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white text-sm min-h-[100px]"
                                        placeholder="Enter your comments..."
                                        value={answers[q.id]}
                                        onChange={e => handleInputChange(q.id, e.target.value)}
                                    />
                                )}

                                {q.type === 'NUMBER' && (
                                    <input
                                        type="number"
                                        required={q.required}
                                        className="w-40 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white text-sm"
                                        value={answers[q.id]}
                                        onChange={e => handleInputChange(q.id, e.target.value)}
                                    />
                                )}

                                {q.type === 'RADIO' && (
                                    <div className="space-y-2">
                                        {q.options.map((opt: string) => (
                                            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    required={q.required}
                                                    checked={answers[q.id] === opt}
                                                    onChange={() => handleInputChange(q.id, opt)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                    {opt}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'CHECKBOX' && (
                                    <div className="space-y-2">
                                        {q.options.map((opt: string) => (
                                            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={(answers[q.id] || []).includes(opt)}
                                                    onChange={e => handleCheckboxChange(q.id, opt, e.target.checked)}
                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                    {opt}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    {onClose && (
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    )}
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Submit Feedback
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
