import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Event } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar, Clock, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { EventDetailsSkeleton } from '@/components/skeleton';

export default function EventDetailsPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    // Need to know if already registered? 
    // API doesn't allow checking registration status easily without failing?
    // We'll treat the "Register" button as idempotent or handle error "Already registered".
    // Actually, we can check if user is allowed to start.

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/api/events/${eventId}`);
                setEvent(response.data);
            } catch (error) {
                navigate('/events');
            } finally {
                setIsLoading(false);
            }
        };
        if (eventId) fetchEvent();
    }, [eventId, navigate]);

    const handleRegister = async () => {
        if (!event || !user) return;
        setIsRegistering(true);
        try {
            await api.post(`/api/events/${event.id}/register`, null, { params: { userId: user.id } });
            toast.success('Successfully registered for the event!');
            // Update UI? Maybe refresh or just show "Start" if live?
        } catch (error: any) {
            // If error says "already registered", that's fine.
            if (error.response?.data?.message?.includes('already')) {
                toast.info('You are already registered.');
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const handleStartTest = () => {
        navigate(`/test/${event?.id}`);
    };

    if (isLoading) return <EventDetailsSkeleton />;
    if (!event) return <div>Event not found</div>;

    const getEventStatus = (start: string, end: string): 'LIVE' | 'UPCOMING' | 'COMPLETED' => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(end);
        if (now < startTime) return 'UPCOMING';
        if (now >= startTime && now <= endTime) return 'LIVE';
        return 'COMPLETED';
    };

    const status = event ? getEventStatus(event.startTime, event.endTime) : 'UPCOMING';
    const isLive = status === 'LIVE';
    const isCompleted = status === 'COMPLETED';

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{event.title}</CardTitle>
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                            {event.type}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <Calendar className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500" />
                            <div>
                                <p className="text-sm font-medium">Start Time</p>
                                <p>{new Date(event.startTime).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <Clock className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500" />
                            <div>
                                <p className="text-sm font-medium">Duration</p>
                                <p>{event.durationInMinutes} minutes</p>
                            </div>
                        </div>
                    </div>

                    {/* Coordinators */}
                    {(event.facultyCoordinators?.length || event.studentCoordinators?.length) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {event.facultyCoordinators?.length ? (
                                <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                    <Users className="h-5 w-5 mr-1 text-gray-400 dark:text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Faculty Coordinators</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {event.facultyCoordinators.map(fc => (
                                                <span key={fc} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">{fc}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                            {event.studentCoordinators?.length ? (
                                <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                    <Users className="h-5 w-5 mr-1 text-gray-400 dark:text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Student Coordinators</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {event.studentCoordinators.map(sc => (
                                                <span key={sc} className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800">{sc}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                        <h4 className="flex items-center text-yellow-800 dark:text-yellow-300 font-medium">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Instructions
                        </h4>
                        <ul className="mt-2 list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                            <li>Total Marks: {event.totalMarks}</li>
                            <li>Ensure you have a stable internet connection.</li>
                            <li>Do not refresh the page during the test.</li>
                            <li>The test will auto-submit when the timer ends.</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4">
                    {!isCompleted && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleRegister}
                                disabled={isRegistering || isLive} // Allow registering if not live? Or even if live?
                                isLoading={isRegistering}
                            >
                                Register
                            </Button>
                            {isLive && (
                                <Button onClick={handleStartTest}>
                                    Start Test
                                </Button>
                            )}
                        </>
                    )}
                    {isCompleted && (
                        <Button variant="outline" disabled>Event Completed</Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
