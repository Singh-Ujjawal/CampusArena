import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/axios';
import { type Contest, type Problem, type Club } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash, Check, Users, X, ClipboardCheck, AlertTriangle, Clock, History as HistoryIcon, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import { AdminContestsPageSkeleton } from '@/components/skeleton';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { DeleteButton } from '@/components/DeleteButton';

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
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: IST_TZ,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/**
 * Convert a datetime-local input value to a UTC ISO string.
 * Appends +05:30 explicitly so it's always treated as IST regardless of browser locale.
 */
function fromISTInput(localValue: string): string {
    if (!localValue) return '';
    return new Date(localValue + ':00+05:30').toISOString();
}

export default function AdminContestsPage() {
    const navigate = useNavigate();
    const [contests, setContests] = useState<Contest[]>([]);
    const [allProblems, setAllProblems] = useState<Problem[]>([]); // Store all problems
    const [clubs, setClubs] = useState<Club[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentContest, setCurrentContest] = useState<Partial<Contest>>({});
    const [registrationForms, setRegistrationForms] = useState<any[]>([]);
    const [contestToDelete, setContestToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchContests();
        fetchProblems(); // Fetch problems on load
        fetchClubs();
        fetchRegistrationForms();
    }, []);

    const fetchRegistrationForms = async () => {
        try {
            const response = await api.get('/api/registration/forms');
            setRegistrationForms(response.data);
        } catch (error) {
            console.error('Failed to load registration forms');
        }
    };

    const fetchClubs = async () => {
        try {
            const response = await api.get('/api/clubs');
            setClubs(response.data);
        } catch (error) {
            console.error('Failed to load clubs');
        }
    };

    const fetchContests = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/contests');
            // Sort contests by creation time (descending)
            const sorted = response.data.sort((a: any, b: any) => {
                const timeA = new Date(a.createdAt || a.startTime).getTime();
                const timeB = new Date(b.createdAt || b.startTime).getTime();
                return timeB - timeA;
            });
            setContests(sorted);
        } catch (error) {
            toast.error('Failed to load contests');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProblems = async () => {
        try {
            const response = await api.get('/api/problems');
            setAllProblems(response.data);
        } catch (error) {
            console.error("Failed to fetch problems");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/api/contests/${id}`);
            toast.success('Contest deleted');
            fetchContests();
            setContestToDelete(null);
        } catch (error) {
            toast.error('Failed to delete contest');
        }
    };

    const handleSave = async () => {
        // Validation
        if (!currentContest.title || !currentContest.startTime || !currentContest.endTime || !currentContest.clubId || !currentContest.accessPassword) {
            toast.error('Please fill in Title, Dates, Club and Password');
            return;
        }

        if (currentContest.title.length >= 30) {
            toast.error('Title must be less than 30 characters');
            return;
        }

        if (currentContest.accessPassword.length !== 6) {
            toast.error('Password must be exactly 6 digits');
            return;
        }

        if (new Date(currentContest.startTime) >= new Date(currentContest.endTime)) {
            toast.error('Start time must be before end time');
            return;
        }

        try {
            const payload = {
                title: currentContest.title,
                startTime: currentContest.startTime, // Already ISO from IST_INPUT
                endTime: currentContest.endTime,     // Already ISO from IST_INPUT
                clubId: currentContest.clubId,
                accessPassword: currentContest.accessPassword,
                problemIds: currentContest.problemIds || [],
                facultyCoordinators: currentContest.facultyCoordinators || [],
                studentCoordinators: currentContest.studentCoordinators || [],
                registrationRequired: currentContest.registrationRequired !== false, // default true
            };

            if (currentContest.id) {
                await api.put(`/api/contests/${currentContest.id}`, payload);
                toast.success('Contest updated');
            } else {
                await api.post('/api/contests', payload);
                toast.success('Contest created');
            }
            setIsEditing(false);
            setCurrentContest({});
            fetchContests();
            fetchRegistrationForms();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to save contest';
            toast.error(msg);
        }
    };


    const toggleProblem = (problemId: string) => {
        const currentIds = currentContest.problemIds || [];
        if (currentIds.includes(problemId)) {
            setCurrentContest({
                ...currentContest,
                problemIds: currentIds.filter(id => id !== problemId)
            });
        } else {
            setCurrentContest({
                ...currentContest,
                problemIds: [...currentIds, problemId]
            });
        }
    };

    const openCreate = () => {
        setCurrentContest({ problemIds: [], registrationRequired: true });
        setIsEditing(true);
    };

    if (isLoading && !isEditing) return <AdminContestsPageSkeleton />;

    return (
        <>
            <div className="p-4 md:p-6 lg:p-0">
                <div className="w-full space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Contest Studio</h1>
                        <Button onClick={openCreate} className="bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600">
                            <Plus className="mr-2 h-4 w-4" /> Create Contest
                        </Button>
                    </div>

                    {isEditing ? (
                        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 py-6">
                                <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">{currentContest.id ? 'Edit Contest' : 'New Contest'}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5 bg-white dark:bg-gray-800 p-6">
                                <div className="space-y-1">
                                    <Input
                                        label="Title"
                                        placeholder="Enter contest title (max 29 chars)"
                                        value={currentContest.title || ''}
                                        maxLength={29}
                                        onChange={e => setCurrentContest({ ...currentContest, title: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 flex justify-between px-1">
                                        <span>Constraint: Title length must be less than 30 characters</span>
                                        <span className={(currentContest.title?.length || 0) > 25 ? 'text-orange-500 font-bold' : ''}>
                                            {currentContest.title?.length || 0}/29
                                        </span>
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Start Time (IST)"
                                        type="datetime-local"
                                        value={currentContest.startTime ? toISTInput(currentContest.startTime) : ''}
                                        onChange={e => setCurrentContest({ ...currentContest, startTime: fromISTInput(e.target.value) })}
                                    />
                                    <Input
                                        label="End Time (IST)"
                                        type="datetime-local"
                                        value={currentContest.endTime ? toISTInput(currentContest.endTime) : ''}
                                        onChange={e => setCurrentContest({ ...currentContest, endTime: fromISTInput(e.target.value) })}
                                    />
                                </div>

                                <Select
                                    label="Club"
                                    value={currentContest.clubId || ''}
                                    onChange={e => setCurrentContest({ ...currentContest, clubId: e.target.value })}
                                    options={clubs.map(c => ({ value: c.id, label: c.name }))}
                                />

                                <Input
                                    label="Access Password (6 digits)"
                                    value={currentContest.accessPassword || ''}
                                    maxLength={6}
                                    placeholder="Enter 6-digit password"
                                    onChange={e => setCurrentContest({ ...currentContest, accessPassword: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Problems</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 p-3 rounded-md bg-white dark:bg-gray-700">
                                        {allProblems.map(problem => {
                                            const isSelected = (currentContest.problemIds || []).includes(problem.id);
                                            return (
                                                <div
                                                    key={problem.id}
                                                    onClick={() => toggleProblem(problem.id)}
                                                    className={`p-2 border rounded cursor-pointer flex justify-between items-center transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-600 text-indigo-900 dark:text-indigo-100' : 'bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'}`}
                                                >
                                                    <span className="text-sm truncate">{problem.title}</span>
                                                    {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />}
                                                </div>
                                            );
                                        })}
                                        {allProblems.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-300 p-2">No problems found. Create problems first.</p>}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Selected: {(currentContest.problemIds || []).length}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TagInput
                                        label="Faculty Coordinators"
                                        values={currentContest.facultyCoordinators || []}
                                        onChange={v => setCurrentContest({ ...currentContest, facultyCoordinators: v })}
                                    />
                                    <TagInput
                                        label="Student Coordinators"
                                        values={currentContest.studentCoordinators || []}
                                        onChange={v => setCurrentContest({ ...currentContest, studentCoordinators: v })}
                                    />
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                    <input
                                        type="checkbox"
                                        id="regReq"
                                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={currentContest.registrationRequired !== false}
                                        onChange={e => setCurrentContest({ ...currentContest, registrationRequired: e.target.checked })}
                                    />
                                    <label htmlFor="regReq" className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                                        Registration Required
                                        <span className="block text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">Participants must fill the registration form before accessing contest problems.</span>
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button variant="outline" onClick={() => setIsEditing(false)} className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</Button>
                                    <Button onClick={handleSave} className="bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 font-semibold">Save</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {contests.map(contest => (
                                <Card key={contest.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-gray-900 transition-shadow overflow-hidden">
                                    <CardContent className="flex flex-col md:flex-row md:items-center justify-between p-4 md:py-3 gap-4 min-h-[140px] md:min-h-0">
                                        <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-1">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight truncate">{contest.title}</h3>
                                            {(contest.facultyCoordinators?.length || contest.studentCoordinators?.length) ? (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 border-l-2 border-indigo-200 dark:border-indigo-800 pl-3 md:block hidden whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {contest.facultyCoordinators?.length ? `Fac.: ${contest.facultyCoordinators.join(', ')}` : ''}
                                                    {contest.facultyCoordinators?.length && contest.studentCoordinators?.length ? ' | ' : ''}
                                                    {contest.studentCoordinators?.length ? `Stu.: ${contest.studentCoordinators.join(', ')}` : ''}
                                                </p>
                                            ) : null}
                                        </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-1 underline-offset-4">
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {new Date(contest.startTime).toLocaleString('en-IN', { timeZone: IST_TZ })} — {new Date(contest.endTime).toLocaleString('en-IN', { timeZone: IST_TZ })}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const now = new Date();
                                                        const start = new Date(contest.startTime);
                                                        const end = new Date(contest.endTime);
                                                        if (now >= start && now <= end) {
                                                            return (
                                                                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-700 flex items-center gap-1">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                                    LIVE
                                                                </span>
                                                            );
                                                        } else if (now < start) {
                                                            return (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700 whitespace-nowrap">
                                                                    <Clock className="h-3 w-3 flex-shrink-0" />
                                                                    UPCOMING
                                                                </span>
                                                            );
                                                        } else {
                                                            return (
                                                                <span className="  px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 flex items-center gap-1">
                                                                    <HistoryIcon className="h-3 w-3" />
                                                                    ENDED
                                                                </span>
                                                            );
                                                        }
                                                    })()}
                                                    {contest.accessPassword && (
                                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 tracking-wider">
                                                            PWD: {contest.accessPassword}
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">
                                                        Problems: {contest.problemIds?.length || 0}
                                                    </span>
                                                </div>
                                            </div>

                                            {(contest.facultyCoordinators?.length || contest.studentCoordinators?.length) ? (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 md:hidden">
                                                    {contest.facultyCoordinators?.length ? `Faculty: ${contest.facultyCoordinators.join(', ')}` : ''}
                                                    {contest.facultyCoordinators?.length && contest.studentCoordinators?.length ? ' | ' : ''}
                                                    {contest.studentCoordinators?.length ? `Students: ${contest.studentCoordinators.join(', ')}` : ''}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                                            <Link to={`/admin/contests/${contest.id}/participants`}>
                                                <Button size="sm" variant="outline" className="flex items-center gap-1 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <Users className="h-4 w-4" />
                                                    Participants
                                                </Button>
                                            </Link>
                                            <Link to={`/leaderboard/${contest.id}`}>
                                                <Button size="sm" variant="outline" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20">
                                                    <Trophy className="h-4 w-4" />
                                                    Leaderboard
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="secondary" className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => { setCurrentContest(contest); setIsEditing(true); }}><Edit className="h-4 w-4" /></Button>

                                            
                                            {registrationForms.find(f => f.contestId === contest.id) ? (
                                                <Button size="sm" variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20" onClick={() => navigate(`/admin/registration/edit/${registrationForms.find(f => f.contestId === contest.id).id}?contestId=${contest.id}&clubId=${contest.clubId}`)}>
                                                    <ClipboardCheck className="h-4 w-4 mr-1 text-emerald-600 dark:text-emerald-400" />Edit Form
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="outline" className="text-red-500 dark:text-red-400 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20" onClick={() => navigate(`/admin/registration/create?contestId=${contest.id}&clubId=${contest.clubId}`)}>
                                                    <ClipboardCheck className="h-4 w-4 mr-1 text-red-500 dark:text-red-400" />Reg. Form
                                                </Button>
                                            )}
                                            
                                            <DeleteButton
                                                onClick={() => setContestToDelete(contest.id)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <DeleteConfirmDialog
                isOpen={!!contestToDelete}
                onClose={() => setContestToDelete(null)}
                onConfirm={() => handleDelete(contestToDelete!)}
                title={contests.find(c => c.id === contestToDelete)?.title || ''}
                itemType="Contest"
            />
        </>
    );
}
