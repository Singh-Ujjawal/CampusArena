import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type LeaderboardEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Medal, RefreshCw, Trophy, Clock, ChevronLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

const POLL_INTERVAL_MS = 30000; // refresh every 30 seconds

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return (
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-yellow-400 text-white font-black text-sm shadow-md shadow-yellow-200 dark:shadow-yellow-900">
            🥇
        </span>
    );
    if (rank === 2) return (
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-500 text-white font-black text-sm shadow-md">
            🥈
        </span>
    );
    if (rank === 3) return (
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-600 text-white font-black text-sm shadow-md shadow-amber-100 dark:shadow-amber-900">
            🥉
        </span>
    );
    return (
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm">
            {rank}
        </span>
    );
}

export default function LeaderboardPage() {
    const { contestId } = useParams();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const fetchLeaderboard = useCallback(async (silent = false) => {
        if (!contestId || !user?.id) return;
        if (!silent) setIsRefreshing(true);
        try {
            // Added userId param
            const response = await api.get(`/api/leaderboard/${contestId}`, {
                params: { userId: user.id }
            });
            const data: LeaderboardEntry[] = response.data || [];
            // Sort: highest score first, then earliest last submission time
            const sorted = [...data].sort((a, b) => {
                if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
                if (a.lastSubmissionTime && b.lastSubmissionTime) {
                    return new Date(a.lastSubmissionTime).getTime() - new Date(b.lastSubmissionTime).getTime();
                }
                return 0;
            });
            setLeaderboard(sorted);
            setLastUpdated(new Date());
            setError(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load leaderboard.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [contestId]);

    // Initial load
    useEffect(() => {
        fetchLeaderboard(false);
    }, [fetchLeaderboard]);

    // Auto-refresh every 30s
    useEffect(() => {
        const interval = setInterval(() => fetchLeaderboard(true), POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchLeaderboard]);

    const formatTime = (isoString: string | null | undefined) => {
        if (!isoString) return '—';
        return new Date(isoString).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            timeZone: 'Asia/Kolkata'
        });
    };

    const formatLastUpdated = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' });
    };

    const handleDownloadCSV = () => {
        if (!leaderboard || leaderboard.length === 0) return;
        
        let csv = 'Rank,Participant,Roll Number,Problems Solved,Last Submission Time,Score\n';
        leaderboard.forEach((entry, index) => {
            const rank = index + 1;
            const pt = entry.username || entry.userId;
            const rn = entry.rollNumber || '—';
            const solved = entry.problemsSolved;
            const lastSub = entry.lastSubmissionTime ? formatTime(entry.lastSubmissionTime as unknown as string) : '—';
            const score = entry.totalScore;
            
            const safePt = pt.includes(',') ? `"${pt}"` : pt;
            const safeRn = rn.includes(',') ? `"${rn}"` : rn;
            
            csv += `${rank},${safePt},${safeRn},${solved},${lastSub},${score}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `leaderboard-${contestId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadPDF = () => {
        if (!leaderboard || leaderboard.length === 0) {
            toast.error('No data to download');
            return;
        }

        const doc = new jsPDF();
        doc.text(`Contest Leaderboard - ${contestId}`, 14, 15);
        
        const tableData = leaderboard.map((entry, index) => [
            index + 1,
            entry.username || entry.userId,
            entry.rollNumber || '—',
            entry.problemsSolved,
            entry.lastSubmissionTime ? formatTime(entry.lastSubmissionTime as unknown as string) : '—',
            entry.totalScore
        ]);

        autoTable(doc, {
            head: [['Rank', 'Participant', 'Roll No', 'Solved', 'Last Submission', 'Score']],
            body: tableData,
            startY: 20
        });

        doc.save(`leaderboard-${contestId}.pdf`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
                <p className="text-gray-500 dark:text-gray-400">Loading leaderboard...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Back button */}
            <Link to={`/contests/${contestId}`}>
                <Button variant="ghost" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Contest
                </Button>
            </Link>

            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <Trophy className="h-8 w-8 text-yellow-300" />
                            <div>
                                <CardTitle className="text-2xl font-black text-white">Contest Leaderboard</CardTitle>
                                <p className="text-indigo-200 text-sm mt-0.5">Live rankings — updates every 30 seconds</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {lastUpdated && (
                                <div className="flex items-center gap-1.5 text-indigo-200 text-xs">
                                    <Clock className="h-3.5 w-3.5" />
                                    Updated: {formatLastUpdated(lastUpdated)}
                                </div>
                            )}
                            <button
                                onClick={() => fetchLeaderboard(false)}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            {user?.role === 'ADMIN' && (
                                <>
                                    <button
                                        onClick={handleDownloadCSV}
                                        className="flex items-center gap-2 bg-emerald-500/80 hover:bg-emerald-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                        title="Download CSV"
                                    >
                                        <Download className="h-4 w-4" />
                                        CSV
                                    </button>
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="flex items-center gap-2 bg-emerald-500/80 hover:bg-emerald-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                        title="Download PDF"
                                    >
                                        <Download className="h-4 w-4" />
                                        PDF
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {error ? (
                        <div className="text-center py-16 text-red-500 dark:text-red-400">
                            <p className="font-semibold">{error}</p>
                            <Button variant="outline" className="mt-4" onClick={() => fetchLeaderboard(false)}>
                                Try Again
                            </Button>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-20 space-y-3">
                            <Medal className="h-14 w-14 text-gray-300 dark:text-gray-600 mx-auto" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No submissions yet.</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to appear on the leaderboard!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 uppercase text-xs font-semibold tracking-wide border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4">Rank</th>
                                        <th className="px-6 py-4">Participant</th>
                                        <th className="px-6 py-4">Roll Number</th>
                                        <th className="px-6 py-4 text-center">Problems Solved</th>
                                        <th className="px-6 py-4">Last Submission</th>
                                        <th className="px-6 py-4 text-right">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {leaderboard.map((entry, idx) => {
                                        const rank = idx + 1;
                                        const isTopThree = rank <= 3;
                                        return (
                                            <tr
                                                key={entry.userId}
                                                className={`transition-colors ${isTopThree
                                                    ? 'bg-gradient-to-r from-yellow-50/60 to-transparent dark:from-yellow-900/10 dark:to-transparent'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                                                    }`}
                                            >
                                                <td className="px-6 py-4">
                                                    <RankBadge rank={rank} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-semibold ${isTopThree ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {entry.username || entry.userId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                                                    {entry.rollNumber || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold text-xs px-2.5 py-1 rounded-full">
                                                        {entry.problemsSolved}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                                    {formatTime(entry.lastSubmissionTime as unknown as string)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`text-lg font-black ${isTopThree ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {entry.totalScore}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Live indicator */}
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live • Refreshes automatically every 30 seconds
                </div>

                <Link to={`/contests/${contestId}`}>
                    <Button variant="outline" className="flex items-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 rounded-xl">
                        <Trophy className="h-4 w-4" />
                        Back to Coding Problems
                    </Button>
                </Link>
            </div>
        </div>
    );
}
