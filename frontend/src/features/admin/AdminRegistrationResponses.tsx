'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle2, XCircle, Clock, Search, Filter,
    ChevronLeft, Download, User as UserIcon, Calendar,
    ExternalLink, Check, X, Eye, FileText, Image as ImageIcon
} from 'lucide-react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface RegistrationResponse {
    id: string;
    formId: string;
    userId: string;
    submittedAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    answers: Record<string, any>;
}

interface RegistrationForm {
    id: string;
    title: string;
    questions: any[];
}

export default function AdminRegistrationResponses() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState<RegistrationForm | null>(null);
    const [responses, setResponses] = useState<RegistrationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const [formRes, respRes] = await Promise.all([
                api.get(`/api/registration/forms/${id}`),
                api.get(`/api/admin/registration/forms/${id}/responses`)
            ]);
            setForm(formRes.data);
            setResponses(respRes.data);
        } catch (error) {
            toast.error('Failed to load response data');
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (respId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.put(`/api/admin/registration/responses/${respId}/status`, null, {
                params: { status }
            });
            setResponses(responses.map(r => r.id === respId ? { ...r, status } : r));
            toast.success(`Registration ${status.toLowerCase()} successfully`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredResponses = responses.filter(r => {
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        // Search in answers
        const matchesSearch = Object.values(r.answers || {}).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchesStatus && matchesSearch;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
        }
    };

    const renderAnswer = (questionId: string, answer: any) => {
        const question = form?.questions.find(q => q.id === questionId);
        if (!question) return String(answer);

        if (question.type === 'IMAGE_UPLOAD' && answer) {
            return (
                <a href={answer} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline font-bold">
                    <ImageIcon className="h-4 w-4" /> View Proof
                </a>
            );
        }
        if (Array.isArray(answer)) return answer.join(', ');
        return String(answer);
    };

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/admin/registration')} className="rounded-xl h-10 w-10 p-0 text-gray-500 hover:text-indigo-600">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white line-clamp-1">
                            {form?.title || 'Responses'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Review and manage participant applications</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 flex gap-1">
                        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${statusFilter === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search in answers (name, roll no, etc)..."
                    className="w-full pl-12 pr-6 py-4 bg-white dark:bg-gray-800 border-none shadow-xl shadow-gray-200/50 dark:shadow-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Fetching responses...</p>
                    </div>
                ) : filteredResponses.length === 0 ? (
                    <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Responses Found</h3>
                        <p className="text-gray-500">No participant has matched your criteria yet.</p>
                    </div>
                ) : (
                    filteredResponses.map((res, index) => (
                        <motion.div
                            key={res.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="border-none shadow-lg shadow-gray-200/30 dark:shadow-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                                <CardContent className="p-0">
                                    <div className="flex flex-col xl:flex-row">
                                        <div className="p-6 xl:w-72 bg-gray-50/50 dark:bg-gray-800/50 border-b xl:border-b-0 xl:border-r border-gray-100 dark:border-gray-700 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                    <UserIcon className="h-6 w-6 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Participant</p>
                                                    <p className="font-bold text-gray-900 dark:text-white truncate max-w-[140px]">User {res.userId.slice(-6)}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(res.submittedAt).toLocaleString()}
                                                </div>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black w-fit ${getStatusStyles(res.status)}`}>
                                                    {res.status === 'PENDING' && <Clock className="h-3 w-3" />}
                                                    {res.status === 'APPROVED' && <Check className="h-3 w-3" />}
                                                    {res.status === 'REJECTED' && <X className="h-3 w-3" />}
                                                    {res.status}
                                                </span>
                                            </div>

                                            {res.status === 'PENDING' && (
                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg h-9 font-bold"
                                                        onClick={() => updateStatus(res.id, 'APPROVED')}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="flex-1 text-red-500 hover:bg-red-50 rounded-lg h-9 font-bold"
                                                        onClick={() => updateStatus(res.id, 'REJECTED')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {Object.entries(res.answers || {}).map(([qId, val]) => (
                                                    <div key={qId} className="space-y-1">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                            {form?.questions.find(q => q.id === qId)?.label || 'Deleted Question'}
                                                        </p>
                                                        <div className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                                                            {renderAnswer(qId, val)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
