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
import { uploadToCloudinary } from '@/utils/cloudinary';

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
        
        // Upload files to Cloudinary first
        const finalAnswers = { ...answers };
        for (const [qId, file] of Object.entries(files)) {
            const result = await uploadToCloudinary(file);
            if (result.error) {
                toast.error(`Failed to upload ${file.name}: ${result.error}`);
                setIsSubmitting(false);
                return;
            }
            finalAnswers[qId] = result.secure_url;
        }

        const formData = new FormData();
        formData.append('userId', user.id || '');

        // Add text and file URL answers
        Object.entries(finalAnswers).forEach(([qId, value]) => {
            if (Array.isArray(value)) {
                formData.append(qId, value.join(', '));
            } else if (value !== undefined && value !== null) {
                formData.append(qId, value.toString());
            }
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
                        <CardContent className="p-8 flex flex-col items-center text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="mb-5"
                            >
                                <div className="bg-emerald-50 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </motion.div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Registration Successful
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
                                Your response for <span className="font-semibold text-slate-900 dark:text-white">"{form.title}"</span> has been submitted.
                            </p>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-6 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 w-full">
                                Our administrative team will review your application shortly.
                            </div>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10 px-6 font-semibold w-full shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10 font-sans selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-100">
            {/* Header */}
            <header className="bg-white dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="w-full px-2 sm:px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4 w-full">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all h-8 px-2 rounded-md text-sm font-medium shrink-0"
                            size="sm"
                        >
                            <ChevronLeft className="h-5 w-5" />
                            <span className="hidden sm:inline font-bold text-base">Back</span>
                        </Button>

                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-md text-[11px] font-bold uppercase tracking-wider border border-indigo-100/50 dark:border-indigo-500/20 shrink-0">
                            <ClipboardCheck className="h-4 w-4" />
                            Form
                        </div>

                        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate flex-1">
                            {form.title}
                        </h1>

                        {(isClosed || isUpcoming) && (
                            <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 shadow-sm font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 animate-pulse ${
                                isClosed
                                    ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-900/60'
                                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-900/60'
                            }`}>
                                <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5" />
                                <span className="hidden sm:inline">{isClosed ? 'REGISTRATION CLOSED' : 'NOT STARTED YET'}</span>
                                <span className="sm:hidden">{isClosed ? 'CLOSED' : 'NOT STARTED'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full mx-auto px-2 sm:px-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-4">
                        <Card className="border border-slate-200/50 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all">
                            <CardContent className="p-3 md:p-5 space-y-5">
                                {form.description && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800/50 text-indigo-900 dark:text-indigo-200 leading-relaxed text-sm font-medium"
                                    >
                                        <div className="flex gap-2">
                                            <AlertCircle className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                                            <div>{form.description}</div>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="space-y-10">
                                    {form.questions.map((q, qIdx) => (
                                        <motion.div
                                            key={q.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: qIdx * 0.05 }}
                                            className="space-y-4 pb-8 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0"
                                            onMouseEnter={() => setFocusedQuestionId(q.id)}
                                            onMouseLeave={() => setFocusedQuestionId(null)}
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <motion.div
                                                    animate={{
                                                        scale: focusedQuestionId === q.id ? 1.05 : 1,
                                                        backgroundColor: focusedQuestionId === q.id ? '#4f46e5' : '#6366f1',
                                                    }}
                                                    className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mt-0.5"
                                                >
                                                    {qIdx + 1}
                                                </motion.div>
                                                <div className="flex-1 space-y-2">
                                                    <label className="text-base font-bold text-slate-900 dark:text-white block">
                                                        {q.label}
                                                        {q.required && <span className="text-red-500 ml-1.5">*</span>}
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="pl-11 space-y-3.5">
                                                {q.type === 'TEXT' && (
                                                    <motion.input
                                                        initial={{ opacity: 0 }}
                                                        whileInView={{ opacity: 1 }}
                                                        type="text"
                                                        required={q.required}
                                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 rounded-xl px-4 py-3 outline-none transition-all text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
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
                                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 rounded-xl px-4 py-3 outline-none transition-all text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                                                        placeholder="Enter a number..."
                                                        value={answers[q.id]}
                                                        onChange={e => handleInputChange(q.id, e.target.value)}
                                                    />
                                                )}

                                                {q.type === 'RADIO' && (
                                                    <motion.div className="space-y-2.5">
                                                        {q.options.map((opt: string, idx: number) => (
                                                            <motion.label
                                                                key={opt}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                whileInView={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                                                    answers[q.id] === opt
                                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600 shadow-sm'
                                                                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50 dark:bg-slate-800/50'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={q.id}
                                                                    className="h-4 w-4 text-indigo-600 dark:text-indigo-400 cursor-pointer focus:ring-indigo-500"
                                                                    required={q.required}
                                                                    checked={answers[q.id] === opt}
                                                                    onChange={() => handleInputChange(q.id, opt)}
                                                                />
                                                                <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">{opt}</span>
                                                            </motion.label>
                                                        ))}
                                                    </motion.div>
                                                )}

                                                {q.type === 'CHECKBOX' && (
                                                    <motion.div className="space-y-2.5">
                                                        {q.options.map((opt: string, idx: number) => (
                                                            <motion.label
                                                                key={opt}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                whileInView={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                                                    (answers[q.id] || []).includes(opt)
                                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-600 shadow-sm'
                                                                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50 dark:bg-slate-800/50'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 dark:text-indigo-400 cursor-pointer focus:ring-indigo-500"
                                                                    checked={(answers[q.id] || []).includes(opt)}
                                                                    onChange={e => handleCheckboxChange(q.id, opt, e.target.checked)}
                                                                />
                                                                <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">{opt}</span>
                                                            </motion.label>
                                                        ))}
                                                    </motion.div>
                                                )}

                                                {q.type === 'DROPDOWN' && (
                                                    <motion.select
                                                        initial={{ opacity: 0 }}
                                                        whileInView={{ opacity: 1 }}
                                                        required={q.required}
                                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl px-4 py-3 outline-none transition-all text-slate-900 dark:text-white text-sm font-medium appearance-none cursor-pointer shadow-sm"
                                                        value={answers[q.id]}
                                                        onChange={e => handleInputChange(q.id, e.target.value)}
                                                        style={{
                                                            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'right 0.75rem center',
                                                            backgroundSize: '1.25em 1.25em',
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
                                                            className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition-all ${
                                                                files[q.id]
                                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'
                                                                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                                                            }`}
                                                        >
                                                            {files[q.id] ? (
                                                                <div className="space-y-4">
                                                                    <motion.div
                                                                        initial={{ scale: 0.95 }}
                                                                        animate={{ scale: 1 }}
                                                                        className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm inline-flex items-center gap-3 border border-slate-200 dark:border-slate-700 w-full max-w-sm"
                                                                    >
                                                                        <div className="h-10 w-10 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                                                            <Upload className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                                        </div>
                                                                        <div className="text-left min-w-0 flex-1">
                                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{files[q.id].name}</p>
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
                                                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 shrink-0 rounded-md"
                                                                        >
                                                                            ✕
                                                                        </Button>
                                                                    </motion.div>
                                                                </div>
                                                            ) : (
                                                                <label className="cursor-pointer flex flex-col items-center py-2">
                                                                    <motion.div
                                                                        animate={{ y: [0, -3, 0] }}
                                                                        transition={{ duration: 2, repeat: Infinity }}
                                                                        className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-3 transition-transform group-hover/upload:scale-110"
                                                                    >
                                                                        <Upload className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                                                    </motion.div>
                                                                    <span className="text-base font-semibold text-slate-900 dark:text-white">Choose File</span>
                                                                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">PNG, JPG up to 2MB</span>
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

                            <CardFooter className="p-5 md:p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/50 dark:border-slate-800 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={Boolean(isSubmitting || isClosed || isUpcoming)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-11 px-8 text-sm font-semibold shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit Registration
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>

                    {/* Sidebar Info */}
                    <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24 h-fit">
                        {/* Timing Card */}
                        <Card className="border border-slate-200/50 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                                <CardTitle className="flex items-center gap-2.5 text-base font-bold text-slate-800 dark:text-slate-100">
                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, x: 5 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700"
                                >
                                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Time</p>
                                        <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold mt-0.5">{form.startTime ? new Date(form.startTime).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'}) : 'Open Now'}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 5 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700"
                                >
                                    <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deadline</p>
                                        <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold mt-0.5">{form.endTime ? new Date(form.endTime).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'}) : 'No Limit'}</p>
                                    </div>
                                </motion.div>
                            </CardContent>
                        </Card>

                        {/* Payment Card */}
                        {form.paymentRequired && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border border-amber-200 dark:border-amber-900/40 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                                    <CardHeader className="p-5 border-b border-amber-100 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10">
                                        <CardTitle className="flex items-center gap-2.5 text-base font-bold text-amber-800 dark:text-amber-500">
                                            <BadgeDollarSign className="h-4 w-4" />
                                            Payment Required
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 space-y-4">
                                        <div className="bg-amber-50/50 dark:bg-amber-900/20 p-3.5 rounded-lg border border-amber-200/60 dark:border-amber-800">
                                            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Fees</p>
                                            <p className="text-2xl font-black text-amber-600 dark:text-amber-300 mt-1">₹{form.paymentFees}</p>
                                        </div>

                                        {form.imageUrl && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                whileInView={{ opacity: 1 }}
                                                className="space-y-3"
                                            >
                                                <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">QR Code for Payment</p>
                                                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-center">
                                                    <img src={form.imageUrl} alt="Payment QR" className="max-h-48 w-auto rounded-md" />
                                                </div>
                                                <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 p-2.5 rounded-md border border-amber-200/50 dark:border-amber-800/50 leading-relaxed font-medium">
                                                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
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
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="border border-blue-200 dark:border-blue-900/40 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                                <CardHeader className="p-5 border-b border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10">
                                    <CardTitle className="flex items-center gap-2.5 text-base font-bold text-blue-800 dark:text-blue-500">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Important Note
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5">
                                    <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed font-medium">
                                        After submission, our administrative team will review your application. Only approved candidates will receive confirmation and be able to participate.
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
