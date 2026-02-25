import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Event } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { EventCardSkeleton } from '@/components/skeleton';


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
                // Error handling in interceptor
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
                {/* Filter Buttons Skeleton */}
                <div className="flex gap-3 flex-wrap">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    ))}
                </div>
                {/* Loading Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <EventCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'LIVE': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded text-xs font-bold';
            case 'UPCOMING': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-xs font-bold';
            case 'COMPLETED': return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded text-xs font-bold';
            default: return 'text-gray-500 dark:text-gray-400';
        }
    };

    // Filter events based on selected status
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
                <h1 className="text-3xl font-bold tracking-tight">Quiz Studio</h1>
                {/* Admin Create Button could go here */}
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 flex-wrap">
                <Button
                    variant={activeFilter === 'LIVE' ? 'primary' : 'outline'}
                    onClick={() => setActiveFilter('LIVE')}
                    className="px-6"
                >
                    Live Events
                </Button>
                <Button
                    variant={activeFilter === 'UPCOMING' ? 'primary' : 'outline'}
                    onClick={() => setActiveFilter('UPCOMING')}
                    className="px-6"
                >
                    Upcoming Events
                </Button>
                <Button
                    variant={activeFilter === 'COMPLETED' ? 'primary' : 'outline'}
                    onClick={() => setActiveFilter('COMPLETED')}
                    className="px-6"
                >
                    Past Events
                </Button>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No events found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check back later for upcoming quizzes.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => (
                        <Card key={event.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl line-clamp-1" title={event.title}>{event.title}</CardTitle>
                                    <span className={getStatusColor(event.status)}>{event.status}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date(event.startTime).toLocaleString()}
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {event.durationInMinutes} mins
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {event.totalMarks} Marks
                                </div>
                                {/* Coordinators */}
                                {(event.facultyCoordinators?.length || event.studentCoordinators?.length) && (
                                    <div className="pt-1 space-y-1.5">
                                        {event.facultyCoordinators?.length ? (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1">
                                                    <Users className="h-3 w-3" /> Faculty Coordinators
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {event.facultyCoordinators.map(fc => (
                                                        <span key={fc} className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-100">{fc}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                        {event.studentCoordinators?.length ? (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1">
                                                    <Users className="h-3 w-3" /> Student Coordinators
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {event.studentCoordinators.map(sc => (
                                                        <span key={sc} className="bg-green-50 text-green-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-green-100">{sc}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Link to={`/events/${event.id}`} className="w-full">
                                    <Button className="w-full" variant={event.status === 'COMPLETED' ? 'outline' : 'primary'}>
                                        {event.status === 'LIVE' ? 'Join Now' : 'View Details'}
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
