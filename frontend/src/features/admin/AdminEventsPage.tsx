import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Event, type Club } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash, X, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import { AdminEventsPageSkeleton } from '@/components/skeleton';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { DeleteButton } from '@/components/DeleteButton';

// ─── Constants ───────────────────────────────────────────────────────────────
const TITLE_MAX = 30;
const DESC_MAX = 100;
const IST_TZ = 'Asia/Kolkata';

// ─── TagInput ────────────────────────────────────────────────────────────────
function TagInput({
    label,
    values,
    onChange,
}: {
    label: string;
    values: string[];
    onChange: (v: string[]) => void;
}) {
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
                    <span
                        key={v}
                        className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 text-sm font-semibold px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-700"
                    >
                        {v}
                        <button
                            type="button"
                            onClick={() => onChange(values.filter(x => x !== v))}
                            className="hover:scale-110 transition-transform"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </span>
                ))}
                <input
                    className="flex-1 min-w-[160px] text-sm outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Type name and press Enter"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            add();
                        }
                    }}
                    onBlur={add}
                />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                Press Enter to add multiple coordinators. Click × to remove.
            </p>
        </div>
    );
}



// ─── Helpers ──────────────────────────────────────────────────────────────────
function toISTInput(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: IST_TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

function fromISTInput(localValue: string): string {
    if (!localValue) return '';
    return new Date(localValue + ':00+05:30').toISOString();
}

// ─── CharCount helper ─────────────────────────────────────────────────────────
function CharCount({ current, max }: { current: number; max: number }) {
    const over = current > max;
    return (
        <span
            className={`text-xs font-medium tabular-nums ${
                over
                    ? 'text-red-600 dark:text-red-400'
                    : current >= max * 0.85
                    ? 'text-amber-500 dark:text-amber-400'
                    : 'text-gray-400 dark:text-gray-500'
            }`}
        >
            {current}/{max}
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminEventsPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({});
    const [registrationForms, setRegistrationForms] = useState<any[]>([]);

    // Delete dialog state
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        eventId: string | null;
        eventTitle: string;
    }>({ open: false, eventId: null, eventTitle: '' });

    useEffect(() => {
        fetchEvents();
        fetchClubs();
        fetchRegistrationForms();
    }, []);

    const fetchRegistrationForms = async () => {
        try {
            const response = await api.get('/api/registration/forms');
            setRegistrationForms(response.data);
        } catch {
            console.error('Failed to load registration forms');
        }
    };

    const fetchClubs = async () => {
        try {
            const response = await api.get('/api/clubs');
            setClubs(response.data);
        } catch {
            console.error('Failed to load clubs');
        }
    };

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/events');
            // Sort newest-first: prefer createdAt, fallback to startTime
            const sorted = [...response.data].sort((a: Event, b: Event) => {
                const aTime = (a as any).createdAt ?? a.startTime ?? '';
                const bTime = (b as any).createdAt ?? b.startTime ?? '';
                return new Date(bTime).getTime() - new Date(aTime).getTime();
            });
            setEvents(sorted);
        } catch {
            toast.error('Failed to load events');
        } finally {
            setIsLoading(false);
        }
    };

    // Opens the delete confirm dialog
    const askDelete = (id: string, title: string) => {
        setDeleteDialog({ open: true, eventId: id, eventTitle: title });
    };

    // Called when user clicks "Yes, Delete" in dialog
    const confirmDelete = useCallback(async () => {
        const id = deleteDialog.eventId;
        setDeleteDialog({ open: false, eventId: null, eventTitle: '' });
        if (!id) return;
        try {
            await api.delete(`/api/events/${id}`);
            toast.success('Event deleted');
            fetchEvents();
        } catch {
            toast.error('Failed to delete event');
        }
    }, [deleteDialog.eventId]);

    const cancelDelete = () =>
        setDeleteDialog({ open: false, eventId: null, eventTitle: '' });

    const handleSave = async () => {
        try {
            if (
                !currentEvent.title ||
                !currentEvent.startTime ||
                !currentEvent.endTime ||
                !currentEvent.clubId ||
                !currentEvent.accessPassword
            ) {
                toast.error('Please fill all required fields including password');
                return;
            }

            if ((currentEvent.title ?? '').length > TITLE_MAX) {
                toast.error(`Title must be ${TITLE_MAX} characters or fewer`);
                return;
            }
            if ((currentEvent.description ?? '').length > DESC_MAX) {
                toast.error(`Description must be ${DESC_MAX} characters or fewer`);
                return;
            }

            if (currentEvent.accessPassword.length !== 6) {
                toast.error('Password must be exactly 6 digits');
                return;
            }

            const payload = {
                ...currentEvent,
                type: 'MCQ',
                startTime: new Date(currentEvent.startTime!).toISOString(),
                endTime: new Date(currentEvent.endTime!).toISOString(),
                registrationRequired: currentEvent.registrationRequired !== false,
            };

            if (currentEvent.id) {
                await api.put(`/api/events/${currentEvent.id}`, payload);
                toast.success('Event updated');
            } else {
                console.log(payload);
                await api.post('/api/events', payload);
                toast.success('Event created');
            }
            setIsEditing(false);
            setCurrentEvent({});
            fetchEvents();
            fetchRegistrationForms();
        } catch (error) {
            console.log(error);
            toast.error('Failed to save event');
        }
    };

    const openEdit = (event: Event) => {
        setCurrentEvent({ ...event });
        setIsEditing(true);
    };

    const openCreate = () => {
        setCurrentEvent({
            type: 'MCQ',
            durationInMinutes: 60,
            totalMarks: 100,
            attendanceProcessed: false,
            status: 'UPCOMING',
            registrationRequired: true,
        });
        setIsEditing(true);
    };

    if (isLoading && !isEditing) return <AdminEventsPageSkeleton />;

    const titleLen = (currentEvent.title ?? '').length;
    const descLen = (currentEvent.description ?? '').length;

    return (
        <>
            <DeleteConfirmDialog
                isOpen={deleteDialog.open}
                title={deleteDialog.eventTitle}
                onConfirm={confirmDelete}
                onClose={cancelDelete}
                itemType="Quiz"
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Quiz Studio</h1>
                    {!isEditing && (
                        <Button
                            onClick={openCreate}
                            className="bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Create Event
                        </Button>
                    )}
                </div>

                {isEditing ? (
                    /* ── Create/Edit Form ── */
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 py-6">
                            <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
                                {currentEvent.id ? 'Edit Event' : 'New Event'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 bg-white dark:bg-gray-800 p-6">
                            {/* Title with char count */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                    <CharCount current={titleLen} max={TITLE_MAX} />
                                </div>
                                <Input
                                    value={currentEvent.title || ''}
                                    maxLength={TITLE_MAX}
                                    onChange={e =>
                                        setCurrentEvent({ ...currentEvent, title: e.target.value.slice(0, TITLE_MAX) })
                                    }
                                    placeholder={`Max ${TITLE_MAX} characters`}
                                />
                                {titleLen > TITLE_MAX && (
                                    <p className="text-xs text-red-500">Title exceeds {TITLE_MAX} characters.</p>
                                )}
                            </div>

                            {/* Description with char count */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <CharCount current={descLen} max={DESC_MAX} />
                                </div>
                                <textarea
                                    className="w-full h-24 p-3 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    placeholder={`Enter event description… (max ${DESC_MAX} characters)`}
                                    maxLength={DESC_MAX}
                                    value={currentEvent.description || ''}
                                    onChange={e =>
                                        setCurrentEvent({
                                            ...currentEvent,
                                            description: e.target.value.slice(0, DESC_MAX),
                                        })
                                    }
                                />
                                {descLen > DESC_MAX && (
                                    <p className="text-xs text-red-500">Description exceeds {DESC_MAX} characters.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Start Time (IST)"
                                    type="datetime-local"
                                    value={currentEvent.startTime ? toISTInput(currentEvent.startTime) : ''}
                                    onChange={e =>
                                        setCurrentEvent({ ...currentEvent, startTime: fromISTInput(e.target.value) })
                                    }
                                />
                                <Input
                                    label="End Time (IST)"
                                    type="datetime-local"
                                    value={currentEvent.endTime ? toISTInput(currentEvent.endTime) : ''}
                                    onChange={e =>
                                        setCurrentEvent({ ...currentEvent, endTime: fromISTInput(e.target.value) })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Duration (mins)"
                                    type="number"
                                    value={currentEvent.durationInMinutes || ''}
                                    onChange={e =>
                                        setCurrentEvent({
                                            ...currentEvent,
                                            durationInMinutes: parseInt(e.target.value),
                                        })
                                    }
                                />
                                <Input
                                    label="Total Marks"
                                    type="number"
                                    value={currentEvent.totalMarks || ''}
                                    onChange={e =>
                                        setCurrentEvent({ ...currentEvent, totalMarks: parseInt(e.target.value) })
                                    }
                                />
                            </div>
                            <Select
                                label="Club"
                                value={currentEvent.clubId || ''}
                                onChange={e => setCurrentEvent({ ...currentEvent, clubId: e.target.value })}
                                options={clubs.map(c => ({ value: c.id, label: c.name }))}
                            />
                            <Input
                                label="Access Password (6 digits)"
                                value={currentEvent.accessPassword || ''}
                                maxLength={6}
                                placeholder="Enter 6-digit password"
                                onChange={e =>
                                    setCurrentEvent({
                                        ...currentEvent,
                                        accessPassword: e.target.value.replace(/\D/g, '').slice(0, 6),
                                    })
                                }
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

                            <div className="flex items-center gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                <input
                                    type="checkbox"
                                    id="regReq"
                                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={currentEvent.registrationRequired !== false}
                                    onChange={e =>
                                        setCurrentEvent({ ...currentEvent, registrationRequired: e.target.checked })
                                    }
                                />
                                <label htmlFor="regReq" className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                                    Registration Required
                                    <span className="block text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                                        Participants must fill the registration form before starting the test.
                                    </span>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 font-semibold"
                                >
                                    Save
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* ── Events List ── */
                    <div className="grid gap-3">
                        {events.map(event => {
                            const hasRegForm = !!registrationForms.find(f => f.eventId === event.id);
                            const regForm = registrationForms.find(f => f.eventId === event.id);
                            const facultyText = event.facultyCoordinators?.length
                                ? `Faculty: ${event.facultyCoordinators.join(', ')}`
                                : '';
                            const studentText = event.studentCoordinators?.length
                                ? `Students: ${event.studentCoordinators.join(', ')}`
                                : '';
                            const hasCoords =
                                !!(event.facultyCoordinators?.length || event.studentCoordinators?.length);

                            return (
                                <Card
                                    key={event.id}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <CardContent className="p-0">
                                        {/*
                                         * Phone  : vertical stack (flex-col)
                                         * Laptop : single row (sm:flex-row), tight height via py-3
                                         */}
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 px-4 sm:py-3">
                                            {/* ── Left: title + meta ── */}
                                            <div className="flex-1 min-w-0">

                                                {/* ── Row 1: Title + Faculty + Students (all inline on laptop) ── */}
                                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:flex-wrap sm:gap-x-2 gap-0.5">
                                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight shrink-0">
                                                        {event.title}
                                                    </h3>
                                                    {/* Faculty — inline right of title on laptop */}
                                                    {facultyText && (
                                                        <span className="hidden sm:inline text-xs font-semibold text-gray-600 dark:text-gray-300 break-words">
                                                            · {facultyText}
                                                        </span>
                                                    )}
                                                    {/* Students — inline after faculty on laptop */}
                                                    {studentText && (
                                                        <span className="hidden sm:inline text-xs font-semibold text-gray-600 dark:text-gray-300 break-words">
                                                            · {studentText}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* ── Row 2: Time + Status badges + PWD (laptop) ── */}
                                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                        {new Date(event.startTime).toLocaleString('en-IN', {
                                                            timeZone: IST_TZ,
                                                        })}
                                                    </span>
                                                    {event.status === 'LIVE' && (
                                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-700">
                                                            LIVE
                                                        </span>
                                                    )}
                                                    {event.status === 'UPCOMING' && (
                                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                                                            UPCOMING
                                                        </span>
                                                    )}
                                                    {event.status === 'COMPLETED' && (
                                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                                                            COMPLETED
                                                        </span>
                                                    )}
                                                    {event.accessPassword && (
                                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 tracking-wider">
                                                            PWD: {event.accessPassword}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* ── Phone only: coordinators below badges ── */}
                                                {hasCoords && (
                                                    <p className="sm:hidden text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1 leading-snug break-words">
                                                        {facultyText}
                                                        {facultyText && studentText ? ' · ' : ''}
                                                        {studentText}
                                                    </p>
                                                )}
                                            </div>

                                            {/* ── Right: action buttons ── */}
                                            <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    onClick={() => openEdit(event)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="dark:border-gray-700 dark:text-gray-200"
                                                    onClick={() =>
                                                        (window.location.href = `/admin/events/${event.id}/questions`)
                                                    }
                                                >
                                                    Questions
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="dark:border-gray-700 dark:text-gray-200"
                                                    onClick={() =>
                                                        (window.location.href = `/admin/events/${event.id}/analytics`)
                                                    }
                                                >
                                                    Analytics
                                                </Button>

                                                {/* Reg. Form button: green if exists, red if not */}
                                                {hasRegForm ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-green-400 text-green-700 bg-green-50 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30 font-semibold"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/registration/edit/${regForm!.id}?eventId=${event.id}&clubId=${event.clubId}`
                                                            )
                                                        }
                                                    >
                                                        <ClipboardCheck className="h-4 w-4 mr-1" />
                                                        Reg. Form
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-400 text-red-600 bg-red-50 hover:bg-red-100 dark:border-red-600 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30 font-semibold"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/registration/create?eventId=${event.id}&clubId=${event.clubId}`
                                                            )
                                                        }
                                                    >
                                                        <ClipboardCheck className="h-4 w-4 mr-1" />
                                                        Reg. Form
                                                    </Button>
                                                )}

                                                <DeleteButton
                                                    onClick={() => askDelete(event.id!, event.title)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
