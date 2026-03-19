'use client';

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Plus, Edit2, BarChart3, Download, Eye, Trash2,
    ClipboardList, Calendar, CheckCircle2, XCircle, Clock,
    Search, Filter, FileText, LayoutGrid
} from 'lucide-react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { DeleteButton } from '@/components/DeleteButton';
import { CreateReportDialog } from './components/CreateReportDialog';
import { FeedbackResultsModal } from './components/FeedbackResultsModal';
import { MessageSquare } from 'lucide-react';
import type { Club } from '@/types';


interface RegistrationForm {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    active: boolean;
    createdAt: string;
    eventId?: string;
    contestId?: string;
    clubId?: string;
    feedbackEnabled?: boolean;
    feedbackQuestions?: any[];
    subClubName?: string;
}

export default function AdminRegistrationHub() {
    const [forms, setForms] = useState<RegistrationForm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [reports, setReports] = useState<any[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [selectedClubId, setSelectedClubId] = useState<string | 'all'>('all');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; formId: string | null; formTitle: string }>({
        open: false,
        formId: null,
        formTitle: ''
    });

    const [reportDialog, setReportDialog] = useState<{
        open: boolean;
        formId: string;
        formTitle: string;
    }>({ open: false, formId: '', formTitle: '' });

    const [feedbackModal, setFeedbackModal] = useState<{
        open: boolean;
        formId: string;
        formTitle: string;
        questions: any[];
    }>({ open: false, formId: '', formTitle: '', questions: [] });

    const navigate = useNavigate();


    useEffect(() => {
        fetchForms();
        fetchReports();
        fetchClubs();
    }, []);

    const fetchClubs = async () => {
        try {
            const response = await api.get('/api/clubs');
            setClubs(response.data);
        } catch {
            console.error('Failed to load clubs');
        }
    };

    const fetchReports = async () => {
        try {
            const response = await api.get('/api/reports');
            setReports(response.data);
        } catch {
            console.error('Failed to load reports');
        }
    };

    const fetchForms = async () => {
        try {
            const response = await api.get('/api/registration/forms');
            // Backend returns list sorted by createdAt desc
            setForms(response.data);
        } catch (error) {
            toast.error('Failed to load registration forms');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/api/admin/registration/forms/${id}`);
            setForms(forms.filter(f => f.id !== id));
            toast.success('Form deleted successfully');
            setDeleteDialog({ open: false, formId: null, formTitle: '' });
        } catch (error) {
            toast.error('Failed to delete form');
        }
    };

    const handleExportCSV = async (id: string, title: string) => {
        try {
            // Need to implement CSV export endpoint or handle it manually
            toast.info('Exporting responses...');
            const response = await api.get(`/api/admin/registration/forms/${id}/responses`);
            const responses = response.data;

            if (responses.length === 0) {
                toast.error('No responses to export');
                return;
            }

            // Simple CSV generation
            const headers = ['Response ID', 'User ID', 'Submitted At', 'Status', ...Object.keys(responses[0].answers || {})];
            const csvRows = [headers.join(',')];

            responses.forEach((res: any) => {
                const row = [
                    res.id,
                    res.userId || 'Guest',
                    new Date(res.submittedAt).toLocaleString(),
                    res.status,
                    ...Object.values(res.answers || {}).map(val => `"${val}"`)
                ];
                csvRows.join(',');
                csvRows.push(row.join(','));
            });

            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title}_responses.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const filteredForms = forms.filter(f => {
        const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClub = selectedClubId === 'all' 
            ? true 
            : selectedClubId === 'none' 
                ? !f.clubId 
                : f.clubId === selectedClubId;
        return matchesSearch && matchesClub;
    });

    const getStatus = (form: RegistrationForm) => {
        const now = new Date();
        const start = new Date(form.startTime);
        const end = form.endTime ? new Date(form.endTime) : null;

        if (!form.active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-600', icon: XCircle, sortOrder: 3 };
        if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-600', icon: Calendar, sortOrder: 2 };
        if (end && now > end) return { label: 'Closed', color: 'bg-red-100 text-red-600', icon: Clock, sortOrder: 4 };
        return { label: 'Live', color: 'bg-green-100/10 text-green-600 border-green-200 dark:border-green-900/30', icon: CheckCircle2, sortOrder: 1 };
    };

    const liveForms = [...filteredForms]
        .filter(f => getStatus(f).label === 'Live')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
    const otherForms = [...filteredForms]
        .filter(f => getStatus(f).label !== 'Live')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const sortedForms = [...liveForms, ...otherForms];

    function renderFormRow(form: RegistrationForm, index: number, isListItem = false) {
        const status = getStatus(form);
        const StatusIcon = status.icon;
        
        return (
            <motion.div
                key={form.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`group relative flex flex-col md:flex-row md:items-center justify-between p-5 gap-6 transition-all ${
                    isListItem 
                    ? "hover:bg-gray-50/50 dark:hover:bg-gray-800/50" 
                    : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                }`}
            >
                <div className="flex flex-col md:flex-row md:items-center gap-5 flex-1 min-w-0">
                    <div className={`hidden md:flex h-12 w-12 rounded-2xl items-center justify-center shrink-0 ${
                        status.label === 'Live' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'
                    }`}>
                        <ClipboardList className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                                {form.title}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight border ${status.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                            </span>
                            {form.subClubName && (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    {form.subClubName}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Ends {new Date(form.endTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(form.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <Link to={`/admin/registration/forms/${form.id}/responses`}>
                            <Button variant="ghost" size="sm" className="h-9 gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-xl px-4 text-xs font-black">
                                <BarChart3 className="h-4 w-4" />
                                RESPONSES
                            </Button>
                        </Link>
                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                        <Link to={`/registration/${form.id}`}>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all" title="Preview">
                                <Eye className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-gray-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all"
                            onClick={() => navigate(`/admin/registration/edit/${form.id}`)}
                            title="Edit"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        {status.label === 'Closed' && (() => {
                            const existingReport = reports.find(r => r.eventId === form.id && r.eventType === 'REGISTRATION');
                            return existingReport ? (
                                <Button
                                    size="sm"
                                    className="h-9 px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-100 dark:shadow-none transition-all hover:scale-105"
                                    onClick={() => navigate(`/admin/reports/${existingReport.id}`)}
                                >
                                    <FileText className="h-4 w-4" />
                                    REPORT
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    className="h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-indigo-100 dark:shadow-none transition-all hover:scale-105"
                                    onClick={() => setReportDialog({ open: true, formId: form.id, formTitle: form.title })}
                                >
                                    <Plus className="h-4 w-4" />
                                    REPORT
                                </Button>
                            );
                        })()}
                        
                        {form.feedbackEnabled && (
                            <Button
                                size="sm"
                                className="h-9 px-4 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-amber-100 dark:shadow-none transition-all hover:scale-105"
                                onClick={() => setFeedbackModal({
                                    open: true,
                                    formId: form.id,
                                    formTitle: form.title,
                                    questions: form.feedbackQuestions || []
                                })}
                            >
                                <MessageSquare className="h-4 w-4" />
                                FEEDBACK
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all"
                            onClick={() => handleExportCSV(form.id, form.title)}
                            title="Export CSV"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                        
                        <DeleteButton
                            onClick={() => setDeleteDialog({ open: true, formId: form.id, formTitle: form.title })}
                        />
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full space-y-8 pb-12 px-4 md:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none">
                                <ClipboardList className="h-7 w-7 text-white" />
                            </div>
                            Registration Hub
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage and track your registration forms</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4.5 w-4.5 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search forms..."
                            className="w-full md:w-72 pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Link to="/admin/registration/create">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11 px-6 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 text-sm font-bold">
                            <Plus className="h-5 w-5 mr-2" />
                            Create Form
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Club Filter - Horizontal Scrolling List */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide no-print">
                <Button
                    onClick={() => setSelectedClubId('all')}
                    variant={selectedClubId === 'all' ? 'primary' : 'outline'}
                    className={`rounded-2xl h-10 px-6 font-bold transition-all shrink-0 ${
                        selectedClubId === 'all' 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none' 
                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 hover:border-indigo-200'
                    }`}
                >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    All
                </Button>

                <Button
                    onClick={() => setSelectedClubId('none')}
                    variant={selectedClubId === 'none' ? 'primary' : 'outline'}
                    className={`rounded-2xl h-10 px-6 font-bold transition-all shrink-0 ${
                        selectedClubId === 'none' 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none' 
                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 hover:border-indigo-200'
                    }`}
                >
                    General
                </Button>
                
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 shrink-0"></div>
                
                {clubs.map((club) => (
                    <Button
                        key={club.id}
                        onClick={() => setSelectedClubId(club.id)}
                        variant={selectedClubId === club.id ? 'primary' : 'outline'}
                        className={`rounded-2xl h-10 px-6 font-bold transition-all shrink-0 ${
                            selectedClubId === club.id 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none' 
                            : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 hover:border-indigo-200'
                        }`}
                    >
                        {club.name}
                    </Button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30"></div>
                        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
                    </div>
                    <p className="mt-6 text-gray-500 dark:text-gray-400 font-bold tracking-tight">Loading Registration Workspace...</p>
                </div>
            ) : sortedForms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl mb-6 ring-8 ring-gray-100 dark:ring-gray-900">
                        <ClipboardList className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">No entries found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm text-center font-medium px-6">
                        {searchQuery ? `We couldn't find any forms matching "${searchQuery}"` : "Get started by creating your first registration form to collect responses."}
                    </p>
                    <Link to="/admin/registration/create" className="mt-8">
                        <Button variant="outline" className="rounded-2xl border-2 font-bold px-8">Create New Form</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Live Section */}
                    {liveForms.length > 0 && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 px-1">
                                <div className="h-6 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">Live Now</h2>
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-600 text-xs px-2.5 py-0.5 rounded-full font-black">{liveForms.length} Active</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {liveForms.map((form, index) => renderFormRow(form, index))}
                            </div>
                        </section>
                    )}

                    {/* All Registrations Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="h-6 w-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">
                                {liveForms.length > 0 ? 'Past & Upcoming' : 'All Registrations'}
                            </h2>
                        </div>
                        <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {otherForms.map((form, index) => renderFormRow(form, index, true))}
                            </div>
                        </div>
                    </section>
                </div>
            )}

            <DeleteConfirmDialog
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, formId: null, formTitle: '' })}
                onConfirm={() => deleteDialog.formId && handleDelete(deleteDialog.formId)}
                title={deleteDialog.formTitle}
                itemType="Registration Form"
            />

            <CreateReportDialog
                isOpen={reportDialog.open}
                onClose={() => setReportDialog({ ...reportDialog, open: false })}
                eventId={reportDialog.formId}
                eventTitle={reportDialog.formTitle}
                eventType="REGISTRATION"
            />

            <FeedbackResultsModal 
                isOpen={feedbackModal.open}
                onClose={() => setFeedbackModal({ ...feedbackModal, open: false })}
                formId={feedbackModal.formId}
                formTitle={feedbackModal.formTitle}
                feedbackQuestions={feedbackModal.questions}
            />
        </div>
    );


}
