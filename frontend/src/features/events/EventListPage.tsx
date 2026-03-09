import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Event } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function EventListPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'LIVE' | 'UPCOMING' | 'COMPLETED'>('LIVE');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/api/events');
                setEvents(response.data);
            } catch (error) {
                toast.error('Failed to load events');
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Quiz Studio</h1>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    ))}
                </div>
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'LIVE': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full text-xs font-bold border border-green-100 dark:border-green-800';
            case 'UPCOMING': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800';
            case 'COMPLETED': return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2.5 py-1 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-600';
            default: return 'text-gray-500 dark:text-gray-400';
        }
    };

    const getEventStatus = (start: string, end: string): 'LIVE' | 'UPCOMING' | 'COMPLETED' => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(end);
        if (now < startTime) return 'UPCOMING';
        if (now >= startTime && now <= endTime) return 'LIVE';
        return 'COMPLETED';
    };

    const filteredEvents = events.filter(event => getEventStatus(event.startTime, event.endTime) === activeFilter);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Quiz Studio</h1>
            </div>

            <div className="flex gap-3 flex-wrap">
                <Button
                    variant={activeFilter === 'LIVE' ? 'primary' : 'outline'}
                    onClick={() => setActiveFilter('LIVE')}
                    className="px-6 rounded-full"
                >
                    Live Events
                </Button>
                <Button
                    variant={activeFilter === 'UPCOMING' ? 'primary' : 'outline'}
                    onClick={() => setActiveFilter('UPCOMING')}
                    className="px-6 rounded-full"
                >
                    Upcoming Events
                </Button>
                <Button
                    variant={activeFilter === 'COMPLETED' ? 'primary' : 'outline'}
                    onClick={() => setActiveFilter('COMPLETED')}
                    className="px-6 rounded-full"
                >
                    Past Events
                </Button>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No events found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check back later for upcoming quizzes.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredEvents.map((event) => (
                        <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row">
                                <div className="flex-1 p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{event.title}</h3>
                                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                                {new Date(event.startTime).toLocaleString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <span className={getStatusColor(event.status)}>{event.status}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1.5 text-indigo-500" />
                                            {event.durationInMinutes} mins
                                        </div>
                                        <div className="flex items-center">
                                            <CheckCircle className="h-4 w-4 mr-1.5 text-indigo-500" />
                                            {event.totalMarks} Marks
                                        </div>
                                        {(event.facultyCoordinators?.length || event.studentCoordinators?.length) && (
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-1.5 text-indigo-500" />
                                                {(event.facultyCoordinators?.length || 0) + (event.studentCoordinators?.length || 0)} Coordinators
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 w-full md:w-48">
                                    <Link to={`/events/${event.id}`} className="w-full">
                                        <Button className="w-full shadow-sm" variant={event.status === 'LIVE' ? 'primary' : 'outline'}>
                                            {event.status === 'LIVE' ? 'Join Now' : 'View Details'}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
