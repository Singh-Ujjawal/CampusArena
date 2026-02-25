'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ClipboardCheck, Calendar, Clock, AlertCircle,
    Upload, CheckCircle2, BadgeDollarSign, CreditCard,
    ChevronLeft, Send, Loader2, Info
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
    paymentQrUrl?: string;
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
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
            <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading form details...</p>
        </div>
    );

    if (!form) return null;

    const isClosed = form.endTime && new Date() > new Date(form.endTime);
    const isUpcoming = form.startTime && new Date() < new Date(form.startTime);

    if (isSubmitted) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto py-20 px-4">
                <Card className="text-center p-12 border-none shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-gray-800 relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                    <div className="bg-green-100 dark:bg-green-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Registration Submitted!</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        Your response for <span className="font-bold text-gray-900 dark:text-white">"{form.title}"</span> has been successfully recorded.
                        You will be notified once it is approved.
                    </p>
                    <Button onClick={() => navigate('/dashboard')} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-10 transition-all hover:scale-105 active:scale-95 font-bold">
                        Return to Dashboard
                    </Button>
                </Card>
            </motion.div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 px-4">
            <header className="mb-8 animate-in slide-in-from-top-4 duration-500">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-gray-500 hover:text-indigo-600 -ml-2">
                    <ChevronLeft className="h-5 w-5 mr-1" /> Back
                </Button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest">
                            <ClipboardCheck className="h-4 w-4" /> Registration Form
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                            {form.title}
                        </h1>
                    </div>
                    {(isClosed || isUpcoming) && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isClosed ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-bold">{isClosed ? 'Registration Closed' : 'Not Started Yet'}</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Logic */}
                <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6 order-2 lg:order-1">
                    <Card className="border-none shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
                        <CardContent className="p-8 space-y-8">
                            {form.description && (
                                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                    {form.description}
                                </div>
                            )}

                            <div className="space-y-10">
                                {form.questions.map((q, qIdx) => (
                                    <div key={q.id} className="space-y-4 animate-in fade-in duration-500" style={{ animationDelay: `${qIdx * 100}ms` }}>
                                        <div className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                                {qIdx + 1}
                                            </span>
                                            <div className="space-y-1">
                                                <label className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {q.label}
                                                    {q.required && <span className="text-red-500 ml-1">*</span>}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="pl-11">
                                            {q.type === 'TEXT' && (
                                                <input
                                                    type="text"
                                                    required={q.required}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-2xl px-6 py-4 outline-none transition-all text-gray-900 dark:text-white text-lg font-medium shadow-sm"
                                                    placeholder="Your answer here..."
                                                    value={answers[q.id]}
                                                    onChange={e => handleInputChange(q.id, e.target.value)}
                                                />
                                            )}

                                            {q.type === 'NUMBER' && (
                                                <input
                                                    type="number"
                                                    required={q.required}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-2xl px-6 py-4 outline-none transition-all text-gray-900 dark:text-white text-lg font-medium shadow-sm"
                                                    placeholder="Enter a number"
                                                    value={answers[q.id]}
                                                    onChange={e => handleInputChange(q.id, e.target.value)}
                                                />
                                            )}

                                            {q.type === 'RADIO' && (
                                                <div className="space-y-3">
                                                    {q.options.map((opt: string) => (
                                                        <label key={opt} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${answers[q.id] === opt ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/20' : 'border-gray-50 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900/50'}`}>
                                                            <input
                                                                type="radio"
                                                                name={q.id}
                                                                className="h-5 w-5 text-indigo-600"
                                                                required={q.required}
                                                                checked={answers[q.id] === opt}
                                                                onChange={() => handleInputChange(q.id, opt)}
                                                            />
                                                            <span className="text-gray-700 dark:text-gray-200 font-bold">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === 'CHECKBOX' && (
                                                <div className="space-y-3">
                                                    {q.options.map((opt: string) => (
                                                        <label key={opt} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${(answers[q.id] || []).includes(opt) ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/20' : 'border-gray-50 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900/50'}`}>
                                                            <input
                                                                type="checkbox"
                                                                className="h-5 w-5 rounded text-indigo-600"
                                                                checked={(answers[q.id] || []).includes(opt)}
                                                                onChange={e => handleCheckboxChange(q.id, opt, e.target.checked)}
                                                            />
                                                            <span className="text-gray-700 dark:text-gray-200 font-bold">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === 'DROPDOWN' && (
                                                <select
                                                    required={q.required}
                                                    className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-2xl px-6 py-4 outline-none transition-all text-gray-900 dark:text-white text-lg font-bold appearance-none cursor-pointer"
                                                    value={answers[q.id]}
                                                    onChange={e => handleInputChange(q.id, e.target.value)}
                                                >
                                                    <option value="" disabled>Select an option</option>
                                                    {q.options.map((opt: string) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {q.type === 'IMAGE_UPLOAD' && (
                                                <div className="relative group/upload">
                                                    <div className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${files[q.id] ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800'}`}>
                                                        {files[q.id] ? (
                                                            <div className="space-y-4">
                                                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm inline-flex items-center gap-3">
                                                                    <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                                                        <Upload className="h-6 w-6 text-indigo-600" />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[200px]">{files[q.id].name}</p>
                                                                        <p className="text-xs text-gray-500">{(files[q.id].size / 1024 / 1024).toFixed(2)} MB</p>
                                                                    </div>
                                                                    <Button variant="ghost" size="sm" onClick={() => setFiles(prev => {
                                                                        const n = { ...prev };
                                                                        delete n[q.id];
                                                                        return n;
                                                                    })} className="text-red-500 hover:text-red-700 hover:bg-red-50">Remove</Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <label className="cursor-pointer flex flex-col items-center">
                                                                <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4 transition-transform group-hover/upload:scale-110">
                                                                    <Upload className="h-8 w-8 text-indigo-600" />
                                                                </div>
                                                                <span className="text-lg font-bold text-gray-900 dark:text-white">Choose File</span>
                                                                <span className="text-sm text-gray-400 mt-1">PNG, JPG up to 2MB</span>
                                                                <input type="file" required={q.required} className="hidden" accept="image/*" onChange={e => handleFileChange(q.id, e)} />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                            <Button
                                type="submit"
                                disabled={Boolean(isSubmitting || isClosed || isUpcoming)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-16 px-12 text-xl font-black shadow-2xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:grayscale"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-6 w-6 mr-2" />
                                        Submit Registration
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

                {/* Info Sidebar */}
                <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
                    <Card className="border-none shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
                        <CardHeader className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
                            <CardTitle className="flex items-center gap-3">
                                <Info className="h-6 w-6" />
                                Participation Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                    <Calendar className="h-6 w-6 text-indigo-500 mt-1" />
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Start Time</p>
                                        <p className="text-gray-900 dark:text-white font-bold">{form.startTime ? new Date(form.startTime).toLocaleString() : 'Open Now'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                    <Clock className="h-6 w-6 text-indigo-500 mt-1" />
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Registration Ends</p>
                                        <p className="text-gray-900 dark:text-white font-bold">{form.endTime ? new Date(form.endTime).toLocaleString() : 'No Limit'}</p>
                                    </div>
                                </div>
                            </div>

                            {form.paymentRequired && (
                                <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-amber-200 flex items-center justify-center">
                                            <BadgeDollarSign className="h-6 w-6 text-amber-700" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Required Fees</p>
                                            <p className="text-2xl font-black text-amber-800 dark:text-amber-200">₹{form.paymentFees}</p>
                                        </div>
                                    </div>

                                    {form.paymentQrUrl && (
                                        <div className="space-y-3">
                                            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Scan QR to Pay</p>
                                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100">
                                                <img src={form.paymentQrUrl} alt="Payment QR" className="w-full h-auto rounded-lg" />
                                            </div>
                                            <div className="flex items-start gap-2 text-xs text-amber-700 italic">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                <span>Note: Please upload the payment screenshot in the respective question section above.</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                                <h4 className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-black text-sm uppercase tracking-widest mb-3">
                                    <CreditCard className="h-4 w-4" /> Final Step
                                </h4>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 leading-relaxed font-medium">
                                    After submitting this form, our administrative team will review your application. Only approved candidates will be able to join the final event/contest.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
