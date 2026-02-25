import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Contest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Trophy, Users } from 'lucide-react';
import { EventCardSkeleton } from '@/components/skeleton';

export default function ContestListPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'LIVE' | 'UPCOMING' | 'COMPLETED'>('LIVE');

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await api.get('/api/contests');
                setContests(response.data);
            } catch (error) {
                // Error handling
            } finally {
                setIsLoading(false);
            }
        };
        fetchContests();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Contests</h1>
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

    const getStatus = (start: string, end: string) => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(end);
        if (now < startTime) return { label: 'UPCOMING', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' };
        if (now >= startTime && now <= endTime) return { label: 'LIVE', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900' };
        return { label: 'Completed', color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900' };
    };

    // Filter contests based on selected status
    const getContestStatus = (start: string, end: string): 'LIVE' | 'UPCOMING' | 'COMPLETED' => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(end);
        if (now < startTime) return 'UPCOMING';
        if (now >= startTime && now <= endTime) return 'LIVE';
        return 'COMPLETED';
    };

    const filteredContests = contests.filter(contest =>
        getContestStatus(contest.startTime, contest.endTime) === activeFilter
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Contests</h1>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 flex-wrap">
                <Button
                    variant={activeFilter === 'LIVE' ? 'primary' : 'outline'}
                    onClick={() => setActiveFilter('LIVE')}
                    className="px-6"
                >
                    Live Contests
                </Button>
                <Button
                    variant={activeFilter === 'UPCOMING' ? 'primary' : 'outline'}
                    onClick={() => setActiveFilter('UPCOMING')}
                    className="px-6"
                >
                    Upcoming Contests
                </Button>
                <Button
                    variant={activeFilter === 'COMPLETED' ? 'primary' : 'outline'}
                    onClick={() => setActiveFilter('COMPLETED')}
                    className="px-6"
                >
                    Past Contests
                </Button>
            </div>

            {filteredContests.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No contests found</h3>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredContests.map((contest) => {
                        const status = getStatus(contest.startTime, contest.endTime);
                        return (
                            <Card key={contest.id} className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900 transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl line-clamp-1 text-gray-900 dark:text-gray-100">{contest.title}</CardTitle>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${status.color}`}>{status.label}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(contest.startTime).toLocaleString()}
                                    </div>
                                    <div className="flex items-center">
                                        <Trophy className="h-4 w-4 mr-2" />
                                        {contest.problemIds?.length || 0} Problems
                                    </div>
                                    {/* Coordinators */}
                                    {(contest.facultyCoordinators?.length || contest.studentCoordinators?.length) && (
                                        <div className="pt-1 space-y-1.5">
                                            {contest.facultyCoordinators?.length ? (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                                                        <Users className="h-3 w-3" /> Faculty Coordinators
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {contest.facultyCoordinators.map(fc => (
                                                            <span key={fc} className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-700">{fc}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}
                                            {contest.studentCoordinators?.length ? (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                                                        <Users className="h-3 w-3" /> Student Coordinators
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {contest.studentCoordinators.map(sc => (
                                                            <span key={sc} className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-green-100 dark:border-green-700">{sc}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Link to={`/contests/${contest.id}`} className="w-full">
                                        <Button className="w-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white" variant={status.label === 'Completed' ? 'outline' : 'primary'}>
                                            View Contest
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
