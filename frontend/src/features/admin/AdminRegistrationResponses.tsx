'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle2, XCircle, Clock, Search,
    ChevronLeft, Download, User as UserIcon, Calendar,
    ExternalLink, Check, X, Eye, FileText, Image as ImageIcon,
    Trophy, GraduationCap, PenTool, Save
} from 'lucide-react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface RegistrationResponse {
    id: string;
    formId: string;
    userId: string;
    username?: string;
    rollNumber?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    course?: string;
    branch?: string;
    section?: string;
    submittedAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    answers: Record<string, any>;
    evaluationMarks?: any[];
    totalEvaluationMarks?: number;
    maxPossibleMarks?: number;
    evaluationStatus?: 'PENDING' | 'GRADED';
    evaluationFeedback?: string;
}

interface RegistrationForm {
    id: string;
    title: string;
    questions: any[];
    evaluationCriteria?: any[];
}

export default function AdminRegistrationResponses() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState<RegistrationForm | null>(null);
    const [responses, setResponses] = useState<RegistrationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
    const [viewingResponse, setViewingResponse] = useState<RegistrationResponse | null>(null);
    const [gradingResponse, setGradingResponse] = useState<RegistrationResponse | null>(null);
    const [marksData, setMarksData] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState('');
    const [isSubmittingMarks, setIsSubmittingMarks] = useState(false);

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

    const handleGradeClick = (resp: RegistrationResponse) => {
        const initialMarks: Record<string, number> = {};
        if (resp.evaluationMarks) {
            resp.evaluationMarks.forEach((m: any) => {
                initialMarks[m.criterionId] = m.marksObtained;
            });
        }
        setMarksData(initialMarks);
        setFeedback(resp.evaluationFeedback || '');
        setGradingResponse(resp);
    };

    const submitMarks = async () => {
        if (!gradingResponse || !form) return;
        setIsSubmittingMarks(true);
        try {
            const marks = form.evaluationCriteria?.map(c => ({
                criterionId: c.id,
                criterionName: c.name,
                marksObtained: marksData[c.id] || 0
            })) || [];

            const response = await api.put(`/api/registration/responses/${gradingResponse.id}/marks`, {
                marks,
                feedback
            });

            setResponses(responses.map(r => r.id === gradingResponse.id ? response.data : r));
            toast.success('Marks updated successfully');
            setGradingResponse(null);
        } catch (error) {
            toast.error('Failed to update marks');
        } finally {
            setIsSubmittingMarks(false);
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
                    <Button 
                        onClick={() => {
                            if (!form || responses.length === 0) return;
                            
                            const headers = [
                                'Username', 'Roll Number', 'Name', 'Email', 
                                'Phone', 'Course', 'Branch', 'Section', 'Status', 'Submitted At'
                            ];
                            
                            const questionHeaders = form.questions.map(q => q.label);
                            const allHeaders = [...headers, ...questionHeaders];
                            
                            const csvData = responses.map(res => {
                                const baseData = [
                                    res.username || '',
                                    res.rollNumber || '',
                                    res.name || '',
                                    res.email || '',
                                    res.phoneNumber || '',
                                    res.course || '',
                                    res.branch || '',
                                    res.section || '',
                                    res.status,
                                    new Date(res.submittedAt).toLocaleString()
                                ];
                                
                                const answerData = form.questions.map(q => {
                                    const ans = res.answers[q.id];
                                    if (ans === undefined || ans === null) return '';
                                    if (Array.isArray(ans)) return ans.join('|');
                                    return String(ans);
                                });
                                
                                return [...baseData, ...answerData].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
                            });
                            
                            const csvContent = [allHeaders.join(','), ...csvData].join('\n');
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `${form.title}_Responses.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" /> Download CSV
                    </Button>
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
                                                    <p className="font-bold text-gray-900 dark:text-white truncate max-w-[140px]">{res.name || res.username || `User ${res.userId.slice(-6)}`}</p>
                                                    {res.rollNumber && <p className="text-[10px] font-medium text-gray-500">{res.rollNumber}</p>}
                                                    {res.email && <p className="text-[10px] font-medium text-gray-400 line-clamp-1">{res.email}</p>}
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

                                            <Button
                                                variant="outline"
                                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 h-10 font-bold"
                                                onClick={() => setViewingResponse(res)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>

                                            {form?.evaluationCriteria && form.evaluationCriteria.length > 0 && res.status === 'APPROVED' && (
                                                <Button
                                                    variant="primary"
                                                    className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white h-10 font-bold border-none"
                                                    onClick={() => handleGradeClick(res)}
                                                >
                                                    <PenTool className="h-4 w-4 mr-2" />
                                                    {res.evaluationStatus === 'GRADED' ? 'Edit Marks' : 'Evaluate'}
                                                </Button>
                                            )}

                                            {res.evaluationStatus === 'GRADED' && (
                                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Trophy className="h-4 w-4 text-green-600" />
                                                        <span className="text-[10px] font-black text-green-700 dark:text-green-300 uppercase tracking-tight">Grade</span>
                                                    </div>
                                                    <span className="text-sm font-black text-green-600">{res.totalEvaluationMarks} / {res.maxPossibleMarks}</span>
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

            <AnimatePresence>
                {viewingResponse && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingResponse(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Registration Details</h2>
                                    <p className="text-sm text-gray-500">Submitted on {new Date(viewingResponse.submittedAt).toLocaleString()}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setViewingResponse(null)} className="rounded-full h-10 w-10 p-0">
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">Form Responses</h3>
                                            <div className="space-y-6">
                                                {Object.entries(viewingResponse.answers || {}).map(([qId, val]) => {
                                                    const question = form?.questions.find(q => q.id === qId);
                                                    if (question?.type === 'IMAGE_UPLOAD') return null;
                                                    return (
                                                        <div key={qId} className="space-y-1.5 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                                                {question?.label || 'Deleted Question'}
                                                            </p>
                                                            <p className="font-bold text-gray-900 dark:text-white text-lg">
                                                                {Array.isArray(val) ? val.join(', ') : String(val)}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">Verification Proof</h3>
                                        {Object.entries(viewingResponse.answers || {}).map(([qId, val]) => {
                                            const question = form?.questions.find(q => q.id === qId);
                                            if (question?.type !== 'IMAGE_UPLOAD' || !val) return null;
                                            return (
                                                <div key={qId} className="space-y-4">
                                                    <div className="aspect-[4/3] rounded-2xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-950 relative group">
                                                        <img src={val} alt="Proof" className="w-full h-full object-contain" />
                                                        <a
                                                            href={val}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2 backdrop-blur-[2px]"
                                                        >
                                                            <ExternalLink className="h-5 w-5" />
                                                            Open Full Image
                                                        </a>
                                                    </div>
                                                    <p className="text-center text-xs text-gray-500 font-medium italic">Click image or button below to view in full resolution</p>
                                                </div>
                                            );
                                        })}
                                        {!Object.values(form?.questions || []).some(q => q.type === 'IMAGE_UPLOAD') && (
                                            <div className="py-12 text-center bg-gray-50 dark:bg-gray-800/40 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                                                <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm text-gray-400 font-medium">No proof upload required<br />for this form</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-4 bg-gray-50/50 dark:bg-gray-800/50">
                                <Button
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl h-12 font-bold text-base shadow-lg shadow-green-100 dark:shadow-none"
                                    onClick={() => {
                                        updateStatus(viewingResponse.id, 'APPROVED');
                                        setViewingResponse(null);
                                    }}
                                    disabled={viewingResponse.status === 'APPROVED'}
                                >
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    Approve Registration
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl h-12 font-bold text-base"
                                    onClick={() => {
                                        updateStatus(viewingResponse.id, 'REJECTED');
                                        setViewingResponse(null);
                                    }}
                                    disabled={viewingResponse.status === 'REJECTED'}
                                >
                                    <XCircle className="mr-2 h-5 w-5" />
                                    Reject Application
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Grading Modal */}
            <AnimatePresence>
                {gradingResponse && form && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setGradingResponse(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-orange-50/50 dark:bg-orange-900/20">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <GraduationCap className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Evaluate Student</h2>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{gradingResponse?.name || gradingResponse?.username}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setGradingResponse(null)} className="rounded-full h-10 w-10 p-0 hover:bg-white dark:hover:bg-gray-800">
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">Criteria-based Marking</h3>
                                    <div className="grid gap-4">
                                        {form.evaluationCriteria?.map((criterion) => (
                                            <div key={criterion.id} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all group">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{criterion.name}</h4>
                                                        <p className="text-[10px] text-gray-400 font-medium">MAXIMUM MARKS: {criterion.maxMarks}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                                            <PenTool className="h-4 w-4 text-indigo-400" />
                                                            <input
                                                                type="number"
                                                                max={criterion.maxMarks}
                                                                min={0}
                                                                placeholder="0"
                                                                className="w-16 bg-transparent border-none focus:ring-0 text-sm font-black text-indigo-600 outline-none p-0"
                                                                value={marksData[criterion.id] ?? ''}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value);
                                                                    if (val > (criterion.maxMarks || 0)) {
                                                                        toast.error(`Marks cannot exceed max marks (${criterion.maxMarks})`);
                                                                        return;
                                                                    }
                                                                    setMarksData(prev => ({ ...prev, [criterion.id]: val }));
                                                                }}
                                                            />
                                                            <span className="text-xs font-bold text-gray-300">/ {criterion.maxMarks}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-3">Evaluation Feedback</h3>
                                    <textarea
                                        placeholder="Add constructive feedback for the student..."
                                        className="w-full min-h-[120px] p-5 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-sm resize-none font-medium"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex bg-gray-50/50 dark:bg-gray-800/50">
                                <Button
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 font-black text-base shadow-xl shadow-indigo-100 dark:shadow-none"
                                    onClick={submitMarks}
                                    isLoading={isSubmittingMarks}
                                >
                                    <Save className="mr-2 h-5 w-5" />
                                    Submit Final Grade
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
