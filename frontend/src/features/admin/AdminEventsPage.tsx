import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { type Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash, X } from 'lucide-react';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import { CLUBS } from '@/lib/constants';
import { AdminEventsPageSkeleton } from '@/components/skeleton';

/**
 * A simple tag-input component for entering a list of names.
 * Press Enter to add a tag; click × to remove.
 */
function TagInput({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
    const [draft, setDraft] = useState('');
    const add = () => {
        const trimmed = draft.trim();
        if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
        setDraft('');
    };
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-h-[50px]">
                {values.map(v => (
                    <span key={v} className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 text-sm font-semibold px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-700">
                        {v}
                        <button type="button" onClick={() => onChange(values.filter(x => x !== v))} className="hover:scale-110 transition-transform">
                            <X className="h-4 w-4" />
                        </button>
                    </span>
                ))}
                <input
                    className="flex-1 min-w-[160px] text-sm outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Type name and press Enter"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                    onBlur={add}
                />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Press Enter to add multiple coordinators. Click × to remove.</p>
        </div>
    );
}

// IST timezone identifier
const IST_TZ = 'Asia/Kolkata';

/**
 * Convert a UTC ISO string to a datetime-local input value displayed in IST.
 * Uses Intl to format the date correctly in IST, avoiding double-offset bugs.
 */
function toISTInput(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Format as YYYY-MM-DDTHH:mm in IST
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: IST_TZ,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/**
 * Convert a datetime-local input value (which the browser treats as LOCAL time)
 * to a UTC ISO string. Since the server is in India and the admin is in India,
 * the browser's local time IS IST — so we just parse it directly.
 */
function fromISTInput(localValue: string): string {
    if (!localValue) return '';
    // Append +05:30 explicitly so it's always treated as IST regardless of browser locale
    return new Date(localValue + ':00+05:30').toISOString();
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({});

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/events');
            setEvents(response.data);
        } catch (error) {
            toast.error('Failed to load events');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await api.delete(`/api/events/${id}`);
            toast.success('Event deleted');
            fetchEvents();
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    const handleSave = async () => {
        try {
            // Validate
            if (!currentEvent.title || !currentEvent.startTime || !currentEvent.endTime || !currentEvent.clubId) {
                toast.error('Please fill required fields (including club)');
                return;
            }

            const payload = {
                ...currentEvent,
                type: "MCQ", // Locked to MCQ
                // Ensure dates are ISO strings
                startTime: new Date(currentEvent.startTime!).toISOString(),
                endTime: new Date(currentEvent.endTime!).toISOString(),
            };

            if (currentEvent.id) {
                await api.put(`/api/events/${currentEvent.id}`, payload);
                toast.success('Event updated');
            } else {
                console.log(payload)
                await api.post('/api/events', payload);
                toast.success('Event created');
            }
            setIsEditing(false);
            setCurrentEvent({});
            fetchEvents();
        } catch (error) {
            console.log(error)
            toast.error('Failed to save event');
        }
    };

    const openEdit = (event: Event) => {
        setCurrentEvent({
            ...event,
        });
        setIsEditing(true);
    };

    const openCreate = () => {
        setCurrentEvent({
            type: 'MCQ',
            durationInMinutes: 60,
            totalMarks: 100,
            attendanceProcessed: false,
            status: 'UPCOMING'
        });
        setIsEditing(true);
    };

    if (isLoading && !isEditing) return <AdminEventsPageSkeleton />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Quiz Studio</h1>
                <Button onClick={openCreate} className="bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"><Plus className="mr-2 h-4 w-4" /> Create Event</Button>
            </div>

            {isEditing ? (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 py-6">
                        <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">{currentEvent.id ? 'Edit Event' : 'New Event'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 bg-white dark:bg-gray-800 p-6">
                        <Input
                            label="Title"
                            value={currentEvent.title || ''}
                            onChange={e => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Start Time (IST)"
                                type="datetime-local"
                                value={currentEvent.startTime ? toISTInput(currentEvent.startTime) : ''}
                                onChange={e => setCurrentEvent({ ...currentEvent, startTime: fromISTInput(e.target.value) })}
                            />
                            <Input
                                label="End Time (IST)"
                                type="datetime-local"
                                value={currentEvent.endTime ? toISTInput(currentEvent.endTime) : ''}
                                onChange={e => setCurrentEvent({ ...currentEvent, endTime: fromISTInput(e.target.value) })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Duration (mins)"
                                type="number"
                                value={currentEvent.durationInMinutes || ''}
                                onChange={e => setCurrentEvent({ ...currentEvent, durationInMinutes: parseInt(e.target.value) })}
                            />
                            <Input
                                label="Total Marks"
                                type="number"
                                value={currentEvent.totalMarks || ''}
                                onChange={e => setCurrentEvent({ ...currentEvent, totalMarks: parseInt(e.target.value) })}
                            />
                        </div>
                        <Select
                            label="Club"
                            value={currentEvent.clubId || ''}
                            onChange={e => setCurrentEvent({ ...currentEvent, clubId: e.target.value })}
                            options={CLUBS.map(c => ({ value: c.id, label: c.name }))}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TagInput
                                label="Faculty Coordinators"
                                values={currentEvent.facultyCoordinators || []}
                                onChange={v => setCurrentEvent({ ...currentEvent, facultyCoordinators: v })}
                            />
                            <TagInput
                                label="Student Coordinators"
                                values={currentEvent.studentCoordinators || []}
                                onChange={v => setCurrentEvent({ ...currentEvent, studentCoordinators: v })}
                            />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="outline" onClick={() => setIsEditing(false)} className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</Button>
                            <Button onClick={handleSave} className="bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 font-semibold">Save</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {events.map(event => (
                        <Card key={event.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{event.title}</h3>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm text-gray-500 dark:text-gray-300">
                                            {new Date(event.startTime).toLocaleString('en-IN', { timeZone: IST_TZ })}
                                        </span>
                                        {event.status === 'LIVE' && (
                                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-700">LIVE</span>
                                        )}
                                        {event.status === 'UPCOMING' && (
                                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">UPCOMING</span>
                                        )}
                                        {event.status === 'COMPLETED' && (
                                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">COMPLETED</span>
                                        )}
                                    </div>
                                    {(event.facultyCoordinators?.length || event.studentCoordinators?.length) ? (
                                        <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                                            {event.facultyCoordinators?.length ? `Faculty: ${event.facultyCoordinators.join(', ')}` : ''}
                                            {event.facultyCoordinators?.length && event.studentCoordinators?.length ? ' | ' : ''}
                                            {event.studentCoordinators?.length ? `Students: ${event.studentCoordinators.join(', ')}` : ''}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="secondary" className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => openEdit(event)}><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="outline" className="dark:border-gray-700 dark:text-gray-200" onClick={() => window.location.href = `/admin/events/${event.id}/questions`}>Questions</Button>
                                    <Button size="sm" variant="outline" className="dark:border-gray-700 dark:text-gray-200" onClick={() => window.location.href = `/admin/events/${event.id}/analytics`}>Analytics</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(event.id!)}><Trash className="h-4 w-4" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
