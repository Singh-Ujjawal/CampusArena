'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ClipboardCheck, Calendar, Clock, AlertCircle,
    Upload, CheckCircle2, BadgeDollarSign,
    ChevronLeft, Send, Loader2
} from 'lucide-react';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface RegistrationForm {
    id: string;
    title: string;
    description: string;
    questions: any[];
    startTime: string;
    endTime: string;
    active: boolean;
    paymentRequired: boolean;
    paymentFees?: number;
    imageUrl?: string;
    imagePublicId?: string;
    eventId?: string;
    contestId?: string;
}

export default function RegistrationFormSubmission() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [form, setForm] = useState<RegistrationForm | null>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [files, setFiles] = useState<Record<string, File>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null);

    useEffect(() => {
        fetchForm();
    }, [id]);

    const fetchForm = async () => {
        try {
            const response = await api.get(`/api/registration/forms/${id}`);
            setForm(response.data);

            // Initialize answers
            const initialAnswers: Record<string, any> = {};
            response.data.questions.forEach((q: any) => {
                if (q.type === 'CHECKBOX') initialAnswers[q.id] = [];
                else initialAnswers[q.id] = '';
            });
            setAnswers(initialAnswers);
        } catch (error) {
            toast.error('Form not found or inaccessible');
            navigate('/dashboard');
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleFileChange = (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFiles(prev => ({ ...prev, [qId]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to submit the form');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('userId', user.id || '');

        // Add text answers
        Object.entries(answers).forEach(([qId, value]) => {
            if (Array.isArray(value)) {
                formData.append(qId, value.join(', '));
            } else {
                formData.append(qId, value);
            }
        });

        // Add files
        Object.entries(files).forEach(([qId, file]) => {
            formData.append(qId, file);
        });

        try {
            await api.post(`/api/registration/forms/${id}/submit`, formData);
            setIsSubmitted(true);
            toast.success('Registration successful!');
            // Redirect back to event/contest if the form is linked
            const redirectTo = form?.eventId ? `/events/${form.eventId}`
                : form?.contestId ? `/contests/${form.contestId}`
                    : '/dashboard';
            setTimeout(() => navigate(redirectTo), 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-6"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full blur-lg opacity-25 animate-pulse"></div>
                    <Loader2 className="h-16 w-16 text-indigo-600 dark:text-indigo-400 animate-spin relative" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">Loading Form</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Please wait while we prepare your registration form...</p>
                </div>
            </motion.div>
        </div>
    );

    if (!form) return null;

    const isClosed = form.endTime && new Date() > new Date(form.endTime);
    const isUpcoming = form.startTime && new Date() < new Date(form.startTime);

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-800">
                        <div className="h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500"></div>
                        <CardContent className="p-8 md:p-12 flex flex-col items-center text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                                className="mb-6"
                            >
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 w-24 h-24 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </motion.div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
                                Success!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                                Your response for <span className="font-bold text-slate-900 dark:text-white block mt-2">"{form.title}"</span> has been successfully submitted.
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                Our administrative team will review your application shortly. You'll be notified of the outcome via email.
                            </p>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl h-12 px-8 font-bold w-full transition-all hover:scale-105 active:scale-95"
                            >
                                Return to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-700">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-3 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 mr-2" />
                        Back
                    </Button>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div className="space-y-2 flex-1">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-widest">
                                <ClipboardCheck className="h-4 w-4" />
                                Registration Form
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                {form.title}
                            </h1>
                            {form.description && (
                                <p className="text-slate-600 dark:text-slate-300 text-base max-w-2xl">
                                    {form.description.length > 100 ? form.description.substring(0, 100) + '...' : form.description}
                                </p>
                            )}
                        </div>

                        {(isClosed || isUpcoming) && (
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-bold text-sm whitespace-nowrap ${
                                    isClosed
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                }`}
                            >
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                {isClosed ? 'Registration Closed' : 'Not Started Yet'}
                            </motion.div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                        <Card className="border border-slate-100 dark:border-slate-700 shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-slate-800 transition-all hover:shadow-xl">
                            <CardContent className="p-6 md:p-10 space-y-10">
                                {form.description && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 leading-relaxed italic"
                                    >
                                        {form.description}
                                    </motion.div>
                                )}

                                <div className="space-y-12">
                                    {form.questions.map((q, qIdx) => (
                                        <motion.div
                                            key={q.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: qIdx * 0.05 }}
                                            className="space-y-4 pb-8 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0"
                                            onMouseEnter={() => setFocusedQuestionId(q.id)}
                                            onMouseLeave={() => setFocusedQuestionId(null)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <motion.div
                                                    animate={{
                                                        scale: focusedQuestionId === q.id ? 1.1 : 1,
                                                        backgroundColor: focusedQuestionId === q.id ? '#4f46e5' : '#6366f1',
                                                    }}
                                                    className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm"
                                                >
                                                    {qIdx + 1}
                                                </motion.div>
                                                <div className="flex-1 space-y-2">
                                                    <label className="text-lg md:text-xl font-bold text-slate-900 dark:text-white block">
                                                        {q.label}
                                                        {q.required && <span className="text-red-500 ml-2">*</span>}
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="pl-14 space-y-4">
                                                {q.type === 'TEXT' && (
                                                    <motion.input
                                                        initial={{ opacity: 0 }}
                                                        whileInView={{ opacity: 1 }}
                                                        type="text"
                                                        required={q.required}
                                                        className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-700/50 rounded-xl px-5 py-3.5 outline-none transition-all text-slate-900 dark:text-white text-base font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                                        placeholder="Your answer here..."
                                                        value={answers[q.id]}
                                                        onChange={e => handleInputChange(q.id, e.target.value)}
                                                    />
                                                )}

                                                {q.type === 'NUMBER' && (
                                                    <motion.input
                                                        initial={{ opacity: 0 }}
                                                        whileInView={{ opacity: 1 }}
                                                        type="number"
                                                        required={q.required}
                                                        className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-700/50 rounded-xl px-5 py-3.5 outline-none transition-all text-slate-900 dark:text-white text-base font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                                        placeholder="Enter a number..."
                                                        value={answers[q.id]}
                                                        onChange={e => handleInputChange(q.id, e.target.value)}
                                                    />
                                                )}

                                                {q.type === 'RADIO' && (
                                                    <motion.div className="space-y-3">
                                                        {q.options.map((opt: string, idx: number) => (
                                                            <motion.label
                                                                key={opt}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                whileInView={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                                                    answers[q.id] === opt
                                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600'
                                                                        : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50 dark:bg-slate-700/50'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={q.id}
                                                                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400 cursor-pointer"
                                                                    required={q.required}
                                                                    checked={answers[q.id] === opt}
                                                                    onChange={() => handleInputChange(q.id, opt)}
                                                                />
                                                                <span className="text-slate-700 dark:text-slate-200 font-medium">{opt}</span>
                                                            </motion.label>
                                                        ))}
                                                    </motion.div>
                                                )}

                                                {q.type === 'CHECKBOX' && (
                                                    <motion.div className="space-y-3">
                                                        {q.options.map((opt: string, idx: number) => (
                                                            <motion.label
                                                                key={opt}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                whileInView={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                                                    (answers[q.id] || []).includes(opt)
                                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600'
                                                                        : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50 dark:bg-slate-700/50'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-5 w-5 rounded text-indigo-600 dark:text-indigo-400 cursor-pointer"
                                                                    checked={(answers[q.id] || []).includes(opt)}
                                                                    onChange={e => handleCheckboxChange(q.id, opt, e.target.checked)}
                                                                />
                                                                <span className="text-slate-700 dark:text-slate-200 font-medium">{opt}</span>
                                                            </motion.label>
                                                        ))}
                                                    </motion.div>
                                                )}

                                                {q.type === 'DROPDOWN' && (
                                                    <motion.select
                                                        initial={{ opacity: 0 }}
                                                        whileInView={{ opacity: 1 }}
                                                        required={q.required}
                                                        className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl px-5 py-3.5 outline-none transition-all text-slate-900 dark:text-white text-base font-medium appearance-none cursor-pointer"
                                                        value={answers[q.id]}
                                                        onChange={e => handleInputChange(q.id, e.target.value)}
                                                        style={{
                                                            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'right 0.75rem center',
                                                            backgroundSize: '1.5em 1.5em',
                                                            paddingRight: '2.5rem',
                                                        }}
                                                    >
                                                        <option value="" disabled>Select an option...</option>
                                                        {q.options.map((opt: string) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </motion.select>
                                                )}

                                                {q.type === 'IMAGE_UPLOAD' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        className="relative group/upload"
                                                    >
                                                        <div
                                                            className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all ${
                                                                files[q.id]
                                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                                                            }`}
                                                        >
                                                            {files[q.id] ? (
                                                                <div className="space-y-6">
                                                                    <motion.div
                                                                        initial={{ scale: 0.8 }}
                                                                        animate={{ scale: 1 }}
                                                                        className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md inline-flex items-center gap-3 border border-slate-100 dark:border-slate-700"
                                                                    >
                                                                        <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                                                            <Upload className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                                                        </div>
                                                                        <div className="text-left min-w-0">
                                                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{files[q.id].name}</p>
                                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{(files[q.id].size / 1024 / 1024).toFixed(2)} MB</p>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => setFiles(prev => {
                                                                                const n = { ...prev };
                                                                                delete n[q.id];
                                                                                return n;
                                                                            })}
                                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ml-2 flex-shrink-0"
                                                                        >
                                                                            ✕
                                                                        </Button>
                                                                    </motion.div>
                                                                </div>
                                                            ) : (
                                                                <label className="cursor-pointer flex flex-col items-center py-4">
                                                                    <motion.div
                                                                        animate={{ y: [0, -4, 0] }}
                                                                        transition={{ duration: 2, repeat: Infinity }}
                                                                        className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4 transition-transform group-hover/upload:scale-110"
                                                                    >
                                                                        <Upload className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                                                    </motion.div>
                                                                    <span className="text-lg font-bold text-slate-900 dark:text-white">Choose File</span>
                                                                    <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">PNG, JPG up to 2MB</span>
                                                                    <input
                                                                        type="file"
                                                                        required={q.required}
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={e => handleFileChange(q.id, e)}
                                                                    />
                                                                </label>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter className="p-6 md:p-10 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={Boolean(isSubmitting || isClosed || isUpcoming)}
                                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl h-14 px-8 md:px-12 text-base md:text-lg font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5 mr-2" />
                                            Submit Registration
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>

                    {/* Sidebar Info */}
                    <aside className="lg:col-span-1 space-y-6 h-fit sticky top-28">
                        {/* Timing Card */}
                        <Card className="border border-slate-100 dark:border-slate-700 shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
                            <CardHeader className="p-6 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-700 dark:to-slate-900 text-white">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <Calendar className="h-5 w-5" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600"
                                >
                                    <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Start Time</p>
                                        <p className="text-slate-900 dark:text-white font-bold mt-1">{form.startTime ? new Date(form.startTime).toLocaleString() : 'Open Now'}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600"
                                >
                                    <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Deadline</p>
                                        <p className="text-slate-900 dark:text-white font-bold mt-1">{form.endTime ? new Date(form.endTime).toLocaleString() : 'No Limit'}</p>
                                    </div>
                                </motion.div>
                            </CardContent>
                        </Card>

                        {/* Payment Card */}
                        {form.paymentRequired && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border border-amber-200 dark:border-amber-800 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                                    <CardHeader className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                                        <CardTitle className="flex items-center gap-3 text-lg">
                                            <BadgeDollarSign className="h-5 w-5" />
                                            Payment Required
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-5">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-amber-200 dark:border-amber-700">
                                            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest">Fees</p>
                                            <p className="text-3xl font-black text-amber-800 dark:text-amber-200 mt-2">₹{form.paymentFees}</p>
                                        </div>

                                        {form.imageUrl && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                whileInView={{ opacity: 1 }}
                                                className="space-y-4"
                                            >
                                                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">QR Code for Payment</p>
                                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-amber-100 dark:border-amber-700/50">
                                                    <img src={form.imageUrl} alt="Payment QR" className="w-full h-auto rounded-lg" />
                                                </div>
                                                <div className="flex items-start gap-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30 p-3 rounded-lg">
                                                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                    <span>After payment, upload the screenshot in the designated form field.</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Final Step Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border border-blue-200 dark:border-blue-800 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                <CardHeader className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Important Note
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
                                        After submission, our administrative team will review your application. Only approved candidates will receive confirmation and be able to participate in the event/contest.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
