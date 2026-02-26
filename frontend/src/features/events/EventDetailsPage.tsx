import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Event } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar, Clock, AlertCircle, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { EventDetailsSkeleton } from '@/components/skeleton';

export default function EventDetailsPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordEntry, setPasswordEntry] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [isRegistered, setIsRegistered] = useState<string | null>(null);
    const [regFormId, setRegFormId] = useState<string | null>(null);
    const [isCheckingReg, setIsCheckingReg] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    useEffect(() => {
        if (eventId && sessionStorage.getItem(`event_access_${eventId}`)) {
            setHasAccess(true);
        }
    }, [eventId]);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/api/events/${eventId}`);
                const eventData = response.data;
                setEvent(eventData);

                if (user && eventData.registrationRequired) {
                    try {
                        const regRes = await api.get(`/api/registration/responses/check`, {
                            params: { eventId, userId: user.id }
                        });
                        setIsRegistered(regRes.data); // data is now the status string from backend

                        if (!regRes.data) {
                            const formRes = await api.get(`/api/registration/forms/event/${eventId}`);
                            setRegFormId(formRes.data.id);
                        }
                    } catch (e) {
                        // Form might not exist yet if flag was false before
                    }
                }
            } catch (error) {
                navigate('/events');
            } finally {
                setIsLoading(false);
                setIsCheckingReg(false);
            }
        };
        if (eventId) fetchEvent();
    }, [eventId, navigate, user]);

    const handleRegister = () => {
        if (regFormId) {
            navigate(`/registration/forms/${regFormId}`);
        } else {
            toast.error('Registration form not found for this event.');
        }
    };

    const handleStartTest = () => {
        if (hasAccess) {
            const pass = sessionStorage.getItem(`event_access_${eventId}`);
            navigate(`/test/${eventId}?pass=${pass}`);
        } else {
            setShowPasswordModal(true);
        }
    };

    const handlePasswordSubmit = async () => {
        if (passwordEntry.length !== 6) {
            toast.error('Please enter a 6-digit password');
            return;
        }

        setIsValidating(true);
        try {
            // Verify password by calling start endpoint
            await api.post(`/api/events/${event?.id}/start`, null, {
                params: { userId: user?.id, accessPassword: passwordEntry }
            });
            // If success, navigate to test page
            sessionStorage.setItem(`event_access_${eventId}`, passwordEntry);
            setHasAccess(true);
            setShowPasswordModal(false);
            navigate(`/test/${event?.id}?pass=${passwordEntry}`);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Invalid password';
            toast.error(msg);
        } finally {
            setIsValidating(false);
        }
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
                    {event.description && (
                        <div className="prose dark:prose-invert max-w-none border-t border-gray-100 dark:border-gray-800 pt-4">
                            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">About Quiz</h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                        </div>
                    )}
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
                            {event.registrationRequired && !isRegistered && !isCheckingReg && (
                                <Button
                                    variant="primary"
                                    onClick={handleRegister}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                >
                                    Register Now
                                </Button>
                            )}

                            {event.registrationRequired && isRegistered && !isLive && (
                                <div className={`text-sm font-semibold px-4 py-2 rounded-lg border flex items-center gap-2 ${
                                    isRegistered === 'APPROVED' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800' :
                                    isRegistered === 'PENDING' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-100 dark:border-yellow-800' :
                                    'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800'
                                }`}>
                                    {isRegistered === 'APPROVED' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                    {isRegistered === 'APPROVED' ? 'Registration Approved' : 
                                     isRegistered === 'PENDING' ? 'Registration Pending Approval' : 
                                     'Registration Rejected'}
                                </div>
                            )}

                            {(!event.registrationRequired || isRegistered === 'APPROVED') && isLive && (
                                <Button onClick={handleStartTest} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                                    Start Test
                                </Button>
                            )}

                            {isLive && event.registrationRequired && isRegistered !== 'APPROVED' && (
                                <div className="text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-4 py-2 rounded-lg border border-amber-100 dark:border-amber-800 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {isRegistered === 'PENDING' ? 'Waiting for Admin Approval' : 'Registration Rejected'}
                                </div>
                            )}

                            {(!event.registrationRequired || isRegistered === 'APPROVED') && !isLive && (
                                <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                    Test starts at {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </>
                    )}
                    {isCompleted && (
                        <Button variant="outline" disabled>Event Completed</Button>
                    )}
                </CardFooter>
            </Card>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-sm shadow-2xl border-indigo-100 dark:border-indigo-900 overflow-hidden transform animate-in zoom-in-95 duration-200">
                        <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-6">
                            <CardTitle className="text-xl">Enter Access Password</CardTitle>
                            <p className="text-indigo-100 text-sm mt-1">Please enter the 6-digit code provided by the admin.</p>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    maxLength={6}
                                    autoFocus
                                    className="w-48 text-center text-3xl font-black tracking-[0.5em] py-3 border-2 border-indigo-100 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:bg-gray-800 dark:text-white"
                                    value={passwordEntry}
                                    onChange={e => setPasswordEntry(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowPasswordModal(false)} disabled={isValidating}>Cancel</Button>
                            <Button
                                onClick={handlePasswordSubmit}
                                isLoading={isValidating}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            >
                                Start Now
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
