import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { type Event, type Contest, type Club, type RegistrationForm } from '@/types';
import { Calendar, Clock, Search, Plus, Building2, Sparkles } from 'lucide-react';

import { DashboardSkeleton } from '@/components/skeleton';

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

// ─── Event Card ─────────────────────────────────────────────────────────────

interface EventCardProps {
    id: string;
    title: string;
    type: 'MCQ' | 'Coding' | 'Registration';
    startTime: string;
    endTime: string;
    href: string;
    clubId?: string;
}

function EventCard({ title, type, startTime, endTime, href }: EventCardProps) {
    return (
        <Link to={href} className="group block">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 h-full border border-gray-100 dark:border-gray-800">
                {/* Card Top — gradient */}
                <div className={`${type === 'MCQ' ? 'from-blue-600 to-indigo-600' : 
                    type === 'Coding' ? 'from-purple-600 to-pink-600' : 
                    'from-emerald-500 to-teal-600'
                    } bg-gradient-to-r p-6 relative min-h-[120px] flex flex-col justify-between`}>
                    {/* Badge + heart */}
                    <div className="flex justify-end items-start gap-2">
                        <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm uppercase tracking-wider">
                            {type}
                        </span>
                    </div>
                    {/* Title */}
                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                        {title}
                    </h3>
                </div>

                {/* Card Bottom — white */}
                <div className="bg-white dark:bg-gray-900 p-5 space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-gray-400 dark:text-gray-500 text-[10px] font-semibold uppercase tracking-tight leading-none">Starts</span>
                            <span className="font-medium mt-1">{formatDate(startTime)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-gray-400 dark:text-gray-500 text-[10px] font-semibold uppercase tracking-tight leading-none">Ends</span>
                            <span className="font-medium mt-1">{formatDate(endTime)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────

type FilterType = 'All' | 'MCQ' | 'Coding' | 'Registration';

export default function DashboardPage() {
    const { user, isAdmin } = useAuth();
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

    // Build unified card list
    const mcqCards: EventCardProps[] = events.map(e => ({
        id: e.id,
        title: e.title,
        type: 'MCQ' as const,
        startTime: e.startTime,
        endTime: e.endTime,
        href: `/events/${e.id}`,
        clubId: e.clubId
    }));

    const codingCards: EventCardProps[] = contests.map(c => ({
        id: c.id,
        title: c.title,
        type: 'Coding' as const,
        startTime: c.startTime,
        endTime: c.endTime,
        href: `/contests/${c.id}`,
        clubId: c.clubId
    }));

    const registrationCards: EventCardProps[] = forms
        .filter(f => f.active && !f.eventId && !f.contestId)
        .map(f => ({
            id: f.id,
            title: f.title,
            type: 'Registration' as const,
            startTime: f.startTime || new Date().toISOString(),
            endTime: f.endTime || new Date(Date.now() + 864000000).toISOString(),
            href: `/registration/forms/${f.id}`,
            clubId: f.clubId
        }));

    const allCards = [...mcqCards, ...codingCards, ...registrationCards];

    const filtered = allCards.filter(card => {
        const matchesSearch = card.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || card.type === filter;
        return matchesSearch && matchesFilter;
    });

    // Grouping logic: Organize items into clubs
    const clubMap = new Map<string, EventCardProps[]>();
    
    // Initialize map with all clubs
    clubs.forEach(club => {
        clubMap.set(club.id, []);
    });

    // Assign items to clubs
    const orphanedItems: EventCardProps[] = [];
    
    filtered.forEach(item => {
        // Try to match by clubId first, then by legacy 'club' field if it's an ID or name
        const rawClubId = item.clubId || (item as any).club;
        
        let targetClub = clubs.find(c => c.id === rawClubId);
        
        // If no ID match, try matching by name (case-insensitive)
        if (!targetClub && typeof rawClubId === 'string') {
            targetClub = clubs.find(c => c.name.toLowerCase() === rawClubId.toLowerCase());
        }

        if (targetClub) {
            clubMap.get(targetClub.id)?.push(item);
        } else {
            orphanedItems.push(item);
        }
    });

    const clubsWithContent = clubs.map(club => ({
        ...club,
        items: clubMap.get(club.id) || []
    })).filter(club => club.items.length > 0 || !search);



    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-12 pb-20">
            {/* ── Hero Banner ─────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-[2rem] p-10 shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                            Welcome {user?.firstName || 'Innovator'} 👋
                        </h1>
                        <p className="text-blue-100/90 mt-4 text-xl max-w-xl font-medium">
                            Ready to showcase your skills? Pick your club and start competing.
                        </p>
                    </div>
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="inline-flex items-center justify-center bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all group"
                        >
                            <span>Admin Panel</span>
                            <Plus className="ml-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                        </Link>
                    )}
                </div>
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="sticky top-[4.5rem] z-40 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md py-4 rounded-b-3xl">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* ── Search Bar ──────────────────────────────────────── */}
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find a contest or quiz..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full border-2 border-transparent rounded-2xl pl-12 pr-4 py-4 text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white dark:bg-gray-800 transition-all shadow-md group-hover:shadow-lg"
                        />
                    </div>

                    {/* ── Filter Buttons ───────────────────────────────────── */}
                    <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-md space-x-1">
                        {(['All', 'MCQ', 'Coding', 'Registration'] as FilterType[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === f
                                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                                    : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-100'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Clubs Sections ────────────────────────────────────── */}
            <div className="space-y-16">
                {clubsWithContent.map(club => (
                    <section key={club.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-16 w-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-center border border-blue-50 dark:border-blue-900 flex-shrink-0 p-1">
                                {club.image ? (
                                    <img
                                        src={club.image}
                                        alt={club.name}
                                        className="h-full w-full object-contain rounded-xl"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <Building2 className="h-8 w-8 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">{club.name}</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Recent and upcoming activities</p>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-4"></div>
                        </div>

                        {club.items.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {club.items.map(card => (
                                    <EventCard key={card.id + card.type} {...card} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] p-12 text-center">
                                <div className="max-w-sm mx-auto">
                                    <p className="text-gray-400 dark:text-gray-400 font-bold text-lg italic">The stage is set... just waiting for actors.</p>
                                    <p className="text-gray-400 dark:text-gray-400 text-sm mt-1">Check back later for contests from this club!</p>
                                </div>
                            </div>
                        )}
                    </section>
                ))}

                {orphanedItems.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-16 w-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-center border border-blue-50 dark:border-blue-900 flex-shrink-0 p-1">
                                <Sparkles className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">General Campus Activities</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Open to all students</p>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-4"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {orphanedItems.map(card => (
                                <EventCard key={card.id + card.type} {...card} />
                            ))}
                        </div>
                    </section>
                )}


                {filtered.length === 0 && (
                    <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col items-center max-w-md mx-auto">
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-full mb-6">
                                <Search className="h-10 w-10 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">No matches found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center h-12">
                                We couldn't find any {filter === 'All' ? 'activities' : filter} matching "<strong>{search}</strong>".
                            </p>
                            <button
                                onClick={() => { setSearch(''); setFilter('All'); }}
                                className="mt-8 text-blue-600 font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
