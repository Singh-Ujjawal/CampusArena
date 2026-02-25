import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Contest, type Problem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Clock, Users } from 'lucide-react';

import { CountdownTimer } from '@/components/CountdownTimer';
import { ContestDetailsSkeleton } from '@/components/skeleton';

const IST_TZ = 'Asia/Kolkata';

export default function ContestDetailsPage() {
    const { contestId } = useParams();
    const { user } = useAuth();
    const [contest, setContest] = useState<Contest | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());
    const [status, setStatus] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContestAndProblems = async () => {
            try {
                const response = await api.get(`/api/contests/${contestId}`);
                const contestData = response.data.contest || response.data;
                const contestStatus = response.data.status || '';
                setContest(contestData);
                setStatus(contestStatus);

                if (contestStatus !== 'UPCOMING' && contestData.problemIds && contestData.problemIds.length > 0) {
                    const problemPromises = contestData.problemIds.map((id: string) =>
                        api.get(`/api/problems/${id}`).then(res => res.data).catch(() => null)
                    );
                    const problemsData = await Promise.all(problemPromises);
                    setProblems(problemsData.filter((p: any) => p !== null));
                }
            } catch (error) {
                console.error("Failed to fetch contest details");
            } finally {
                setIsLoading(false);
            }
        };
        if (contestId) fetchContestAndProblems();
    }, [contestId]);

    // Fetch user's accepted submissions for this contest
    useEffect(() => {
        const fetchSolvedProblems = async () => {
            if (!user || !contestId) return;
            try {
                const response = await api.get(`/api/submissions/user/${user.id}`);
                const submissions: Array<{ problemId: string; contestId: string; verdict: string }> = response.data;
                const solved = new Set(
                    submissions
                        .filter(s => s.contestId === contestId && s.verdict === 'ACCEPTED')
                        .map(s => s.problemId)
                );
                setSolvedProblemIds(solved);
            } catch {
                // silently ignore
            }
        };
        fetchSolvedProblems();
    }, [user, contestId]);

    if (isLoading) return <ContestDetailsSkeleton />;
    if (!contest) return <div className="text-gray-900 dark:text-gray-100">Contest not found</div>;

    const solvedCount = problems.filter(p => solvedProblemIds.has(p.id)).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contest - {contest.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(contest.startTime).toLocaleString('en-IN', { timeZone: IST_TZ })} — {new Date(contest.endTime).toLocaleString('en-IN', { timeZone: IST_TZ })}
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    {status === 'LIVE' && (
                        <CountdownTimer
                            targetDate={contest.endTime}
                            label="Ends In"
                            className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600"
                        />
                    )}
                    {status === 'UPCOMING' && (
                        <CountdownTimer
                            targetDate={contest.startTime}
                            label="Starts In"
                            className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-2xl border border-blue-200 dark:border-blue-700"
                            onEnd={() => window.location.reload()}
                        />
                    )}
                    {problems.length > 0 && (
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            {solvedCount} / {problems.length} Solved
                        </span>
                    )}
                    <Link to={`/leaderboard/${contest.id}`}>
                        <Button variant="outline" className="rounded-2xl font-bold shadow-sm text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">View Leaderboard</Button>
                    </Link>
                </div>
            </div>

            {/* Coordinators */}
            {(contest.facultyCoordinators?.length || contest.studentCoordinators?.length) && (
                <div className="flex flex-wrap gap-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-6 py-4">
                    {contest.facultyCoordinators?.length ? (
                        <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Faculty Coordinators</p>
                                <div className="flex flex-wrap gap-1">
                                    {contest.facultyCoordinators.map(fc => (
                                        <span key={fc} className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-700">{fc}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null}
                    {contest.studentCoordinators?.length ? (
                        <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Student Coordinators</p>
                                <div className="flex flex-wrap gap-1">
                                    {contest.studentCoordinators.map(sc => (
                                        <span key={sc} className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-100 dark:border-green-700">{sc}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            <div className="grid gap-4">
                {status === 'UPCOMING' ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-[2rem] p-12 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="bg-white dark:bg-gray-800 h-16 w-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 mb-6">
                                <Clock className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-300">Wait for the battle to begin!</h2>
                            <p className="text-blue-700 dark:text-blue-300/80 font-medium leading-relaxed">
                                This contest is currently <span className="font-bold underline">Upcoming</span>. Problems will be revealed automatically when the clock strikes start time.
                            </p>
                            <div className="pt-4">
                                <div className="text-sm text-blue-600 dark:text-blue-400/60 font-bold uppercase tracking-widest mb-2">Starts at</div>
                                <div className="text-xl font-black text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 inline-block px-6 py-3 rounded-2xl shadow-sm">
                                    {new Date(contest.startTime).toLocaleString('en-IN', { timeZone: IST_TZ, hour: '2-digit', minute: '2-digit', hour12: true, day: '2-digit', month: 'short' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : problems.length > 0 ? (
                    problems.map((problem, idx) => {
                        const isSolved = solvedProblemIds.has(problem.id);
                        return (
                            <Card
                                key={problem.id}
                                className={`hover:shadow-md transition-shadow rounded-[1.5rem] overflow-hidden ${isSolved ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
                            >
                                <CardContent className="flex items-center justify-between p-6">
                                    <div className="flex items-center gap-4">
                                        <span className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 shadow-sm ${isSolved
                                            ? 'bg-green-500 text-white dark:bg-green-600'
                                            : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-600'
                                            }`}>
                                            {isSolved
                                                ? <CheckCircle2 className="h-5 w-5" />
                                                : String.fromCharCode(65 + idx)
                                            }
                                        </span>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                                {problem.title}
                                                {isSolved && (
                                                    <span className="text-[10px] font-black tracking-widest text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded uppercase">
                                                        Solved
                                                    </span>
                                                )}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${problem.difficulty === 'EASY' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                                                    problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                                                        'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                                    }`}>
                                                    {problem.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link to={`/contests/${contest.id}/problem/${problem.id}`}>
                                        <Button variant={isSolved ? 'outline' : 'primary'} size="sm" className="rounded-xl font-bold px-6">
                                            {isSolved ? 'View' : 'Solve'} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] p-12 text-center">
                        <p className="text-gray-400 dark:text-gray-500 font-bold italic">The problems are being prepared. Stay tuned!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
