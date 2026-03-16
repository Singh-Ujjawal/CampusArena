import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar, User, ChevronRight, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import type { Report } from '@/types';

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('/api/reports');
            setReports(response.data);
        } catch (error) {
            toast.error('Failed to fetch reports');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredReports = reports.filter(report => 
        report.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <FileText className="h-8 w-8 text-indigo-600" />
                        Event Reports
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        View and manage all generated event reports
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-[250px] sm:w-[300px] rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        />
                    </div>
                </div>
            </div>

            {filteredReports.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-white dark:bg-gray-700 p-4 rounded-full shadow-sm mb-4">
                            <FileText className="h-12 w-12 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No reports found</h3>
                        <p className="text-gray-500 max-w-xs mt-2">
                            Generated reports will appear here. Go to events or contests to create a new report.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report) => (
                        <Card 
                            key={report.id}
                            className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-all group overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/admin/reports/${report.id}`)}
                        >
                            <div className="h-2 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        report.eventType === 'QUIZ' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                                        report.eventType === 'CONTEST' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30' :
                                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                    }`}>
                                        {report.eventType}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">
                                        #{report.id.slice(-6)}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                    {report.eventName}
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                        <User className="h-4 w-4 text-indigo-500" />
                                        <span>By {report.createdBy}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center group">
                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                        View Report <ChevronRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
