'use client';

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Plus, Edit2, BarChart3, Download, Eye, Trash2,
    ClipboardList, Calendar, CheckCircle2, XCircle, Clock,
    Search, Filter
} from 'lucide-react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
}

export default function AdminRegistrationHub() {
    const [forms, setForms] = useState<RegistrationForm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchForms();
    }, []);

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
        if (!confirm('Are you sure you want to delete this form? All responses will be lost.')) return;
        try {
            await api.delete(`/api/admin/registration/forms/${id}`);
            setForms(forms.filter(f => f.id !== id));
            toast.success('Form deleted successfully');
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

    const filteredForms = forms.filter(f =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatus = (form: RegistrationForm) => {
        const now = new Date();
        const start = new Date(form.startTime);
        const end = form.endTime ? new Date(form.endTime) : null;

        if (!form.active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-600', icon: XCircle };
        if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-600', icon: Calendar };
        if (end && now > end) return { label: 'Closed', color: 'bg-red-100 text-red-600', icon: Clock };
        return { label: 'Live', color: 'bg-green-100 text-green-600', icon: CheckCircle2 };
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <ClipboardList className="h-8 w-8 text-indigo-600" />
                        Registration Hub
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all registration forms and participant data</p>
                </div>
                <Link to="/admin/registration/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-6 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">
                        <Plus className="h-5 w-5 mr-2" />
                        Create Form
                    </Button>
                </Link>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search forms by title or description..."
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="rounded-xl h-12 px-6 border-gray-200 dark:border-gray-700">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-gray-500">Loading your forms...</p>
                    </div>
                ) : filteredForms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-full mb-4">
                            <ClipboardList className="h-12 w-12 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Forms Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs text-center">
                            {searchQuery ? "No forms match your search query." : "Start by creating your first registration form for a club or event."}
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredForms.map((form, index) => {
                            const status = getStatus(form);
                            const StatusIcon = status.icon;
                            const isEventLinked = !!(form.eventId || form.contestId);

                            return (
                                <motion.div
                                    key={form.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group"
                                >
                                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                                        {isEventLinked && (
                                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                        )}

                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                    {form.title}
                                                </h3>
                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {status.label}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 max-w-2xl">
                                                {form.description || "No description provided."}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                                    <span>Ends {new Date(form.endTime).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                    <Clock className="h-4 w-4 text-indigo-500" />
                                                    <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xl h-10 w-10 p-0 text-gray-400 hover:text-indigo-600"
                                                onClick={() => navigate(`/admin/registration/edit/${form.id}`)}
                                                title="Edit Form"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xl h-10 w-10 p-0 text-gray-400 hover:text-green-600"
                                                onClick={() => handleExportCSV(form.id, form.title)}
                                                title="Export Responses"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Link to={`/admin/registration/forms/${form.id}/responses`}>
                                                <Button variant="secondary" size="sm" className="rounded-xl h-10 gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 border-none px-4">
                                                    <BarChart3 className="h-4 w-4" />
                                                    View Responses
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xl h-10 w-10 p-0 text-gray-400 hover:text-red-600"
                                                onClick={() => handleDelete(form.id)}
                                                title="Delete Form"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Link to={`/registration/${form.id}`}>
                                                <Button variant="outline" size="sm" className="rounded-xl h-10 w-10 p-0 border-gray-200 dark:border-gray-700" title="Preview">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
