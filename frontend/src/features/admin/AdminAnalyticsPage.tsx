import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, FileDown } from 'lucide-react';
import { AdminAnalyticsPageSkeleton } from '@/components/skeleton';
import { toast } from 'sonner';

export default function AdminAnalyticsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/api/events').then(res => {
            setEvents(res.data);
            setIsLoading(false);
        }).catch(() => setIsLoading(false));
    }, []);

    const downloadPdf = async (eventId: string) => {
        try {
            const response = await api.get(`/api/events/${eventId}/analytics/pdf`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics-${eventId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Downloading report...");
        } catch (error) {
            toast.error("Failed to download report");
        }
    };

    if (isLoading) return <AdminAnalyticsPageSkeleton />;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics & Reports</h1>
            <div className="grid gap-4">
                {events.map(event => (
                    <Card key={event.id}>
                        <CardContent className="flex justify-between items-center p-6">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{event.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-300">{new Date(event.startTime).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <Link
                                    to={`/admin/events/${event.id}/analytics`}
                                    className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                                >
                                    <BarChart3 className="mr-1 h-4 w-4" /> View Details
                                </Link>
                                <button
                                    onClick={() => downloadPdf(event.id)}
                                    className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200"
                                >
                                    <FileDown className="mr-1 h-4 w-4" /> Download PDF
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
