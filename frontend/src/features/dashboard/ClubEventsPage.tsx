import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Event, type Contest, type Club, type RegistrationForm } from '@/types';
import { Calendar, Clock, ChevronLeft, Building2, Search, CheckCircle, Users, Trophy } from 'lucide-react';
import { DashboardSkeleton } from '@/components/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const IST_TZ = 'Asia/Kolkata';

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
        timeZone: IST_TZ,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

interface EventCardProps {
    id: string;
    title: string;
    type: 'MCQ' | 'Coding' | 'Registration';
    startTime: string;
    endTime: string;
    href: string;
    clubId?: string;
    status?: string;
}

function EventCard({ title, type, startTime, href, status }: EventCardProps) {
    const getStatusColor = (s?: string) => {
        switch (s) {
            case 'LIVE': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full text-xs font-bold border border-green-100 dark:border-green-800';
            case 'UPCOMING': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800';
            case 'COMPLETED': return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2.5 py-1 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-600';
            default: return 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-bold';
        }
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                    type === 'MCQ' ? 'bg-blue-100 text-blue-700' : 
                                    type === 'Coding' ? 'bg-purple-100 text-purple-700' : 
                                    'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {type}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                {formatDate(startTime)}
                            </p>
                        </div>
                        {status && <span className={getStatusColor(status)}>{status}</span>}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                            {type === 'Coding' ? <Trophy className="h-4 w-4 mr-1.5 text-amber-500" /> : <Clock className="h-4 w-4 mr-1.5 text-blue-500" />}
                            {type === 'Coding' ? 'Contest' : 'Quiz'}
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-5 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 w-full md:w-48">
                    <Link to={href} className="w-full">
                        <Button className="w-full shadow-sm" variant={status === 'LIVE' ? 'primary' : 'outline'}>
                            {status === 'LIVE' ? (type === 'Coding' ? 'Enter Arena' : 'Join Now') : 'View Details'}
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
}

type FilterType = 'All' | 'MCQ' | 'Coding' | 'Registration';

export default function ClubEventsPage() {
    const { clubId } = useParams();
    const [events, setEvents] = useState<Event[]>([]);
    const [contests, setContests] = useState<Contest[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [forms, setForms] = useState<RegistrationForm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [eventsRes, contestsRes, clubsRes, formsRes] = await Promise.all([
                    api.get('/api/events').catch(() => ({ data: [] })),
                    api.get('/api/contests').catch(() => ({ data: [] })),
                    api.get('/api/clubs').catch(() => ({ data: [] })),
                    api.get('/api/registration/forms').catch(() => ({ data: [] })),
                ]);
                setEvents(eventsRes.data || []);
                setContests(contestsRes.data || []);
                setClubs(clubsRes.data || []);
                setForms(formsRes.data || []);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    const currentClub = clubs.find(c => c.id === clubId || c.name === clubId);

    const getStatus = (start: string, end: string): string => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(end);
        if (now < startTime) return 'UPCOMING';
        if (now >= startTime && now <= endTime) return 'LIVE';
        return 'COMPLETED';
    };

    if (isLoading) {
        return (
            <div className="space-y-8 pb-20">
                <div className="h-16 w-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-32 w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!currentClub) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Club not found</h2>
                <Link to="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">Back to Dashboard</Link>
            </div>
        );
    }

    // Build unified card list filtered by club
    const mcqCards: EventCardProps[] = events
        .filter(e => e.clubId === currentClub.id || (e as any).club === currentClub.id || (e as any).club === currentClub.name)
        .map(e => ({
            id: e.id,
            title: e.title,
            type: 'MCQ' as const,
            startTime: e.startTime,
            endTime: e.endTime,
            href: `/events/${e.id}`,
            clubId: e.clubId,
            status: getStatus(e.startTime, e.endTime)
        }));

    const codingCards: EventCardProps[] = contests
        .filter(c => c.clubId === currentClub.id || (c as any).club === currentClub.id || (c as any).club === currentClub.name)
        .map(c => ({
            id: c.id,
            title: c.title,
            type: 'Coding' as const,
            startTime: c.startTime,
            endTime: c.endTime,
            href: `/contests/${c.id}`,
            clubId: c.clubId,
            status: getStatus(c.startTime, c.endTime)
        }));

    const registrationCards: EventCardProps[] = forms
        .filter(f => f.active && !f.eventId && !f.contestId)
        .filter(f => f.clubId === currentClub.id || (f as any).club === currentClub.id || (f as any).club === currentClub.name)
        .map(f => ({
            id: f.id,
            title: f.title,
            type: 'Registration' as const,
            startTime: f.startTime || new Date().toISOString(),
            endTime: f.endTime || new Date(Date.now() + 864000000).toISOString(),
            href: `/registration/forms/${f.id}`,
            clubId: f.clubId,
            status: 'LIVE'
        }));

    const allCards = [...mcqCards, ...codingCards, ...registrationCards];

    const filtered = allCards.filter(card => {
        const matchesSearch = card.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || card.type === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center border border-blue-50 dark:border-blue-900 overflow-hidden">
                        {currentClub.image ? (
                            <img src={currentClub.image} alt={currentClub.name} className="h-full w-full object-contain" />
                        ) : (
                            <Building2 className="h-6 w-6 text-blue-600" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100">{currentClub.name}</h1>
                        <p className="text-gray-500 text-sm">All activities and contests</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center sticky top-[4.5rem] z-40 bg-gray-100 dark:bg-gray-900 py-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search in this club..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full rounded-2xl pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 outline-none shadow-sm"
                    />
                </div>
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
                    {(['All', 'MCQ', 'Coding', 'Registration'] as FilterType[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {filtered.map(card => (
                    <EventCard key={card.id + card.type} {...card} />
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 font-medium">No results found for your search.</p>
                </div>
            )}
        </div>
    );
}
