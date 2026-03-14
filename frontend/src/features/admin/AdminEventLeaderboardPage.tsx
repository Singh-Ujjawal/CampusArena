import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, Trophy, Clock, ChevronLeft, Download, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EventLeaderboardEntry {
    userId: string;
    username: string;
    rollNumber: string;
    score: number;
    correctAnswers: number;
    attempted: number;
    submittedAt: string;
}

const POLL_INTERVAL_MS = 30000;

export default function EventLeaderboardPage() {
    const { eventId } = useParams();
    const [leaderboard, setLeaderboard] = useState<EventLeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();

    const fetchLeaderboard = useCallback(async (silent = false) => {
        if (!eventId) return;
        if (!silent) setIsRefreshing(true);
        try {
            const response = await api.get(`/api/events/leaderboard/${eventId}`);
            setLeaderboard(response.data || []);
            setLastUpdated(new Date());
            setError(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load event leaderboard.');
            toast.error('Failed to load leaderboard');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchLeaderboard(false);
    }, [fetchLeaderboard]);

    useEffect(() => {
        const interval = setInterval(() => fetchLeaderboard(true), POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchLeaderboard]);

    const formatTime = (isoString: string | null) => {
        if (!isoString) return '—';
        return new Date(isoString).toLocaleString('en-IN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit',
            timeZone: 'Asia/Kolkata'
        });
    };

    const handleDownloadCSV = () => {
        if (!leaderboard || leaderboard.length === 0) {
            toast.error('No data to download');
            return;
        }
        
        let csv = 'Rank,Participant,Roll Number,Score,Correct,Attempted,Submitted At\n';
        leaderboard.forEach((entry, index) => {
            const rank = index + 1;
            const pt = entry.username || entry.userId;
            const rn = entry.rollNumber || '—';
            const score = entry.score;
            const correct = entry.correctAnswers;
            const attempted = entry.attempted;
            const subAt = entry.submittedAt ? formatTime(entry.submittedAt) : '—';
            
            const safePt = pt.includes(',') ? `"${pt}"` : pt;
            const safeRn = rn.includes(',') ? `"${rn}"` : rn;
            
            csv += `${rank},${safePt},${safeRn},${score},${correct},${attempted},${subAt}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `quiz-leaderboard-${eventId}.csv`);
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
        doc.text(`Quiz Leaderboard - Event ID: ${eventId}`, 14, 15);
        
        const tableData = leaderboard.map((entry, index) => [
            index + 1,
            entry.username || entry.userId,
            entry.rollNumber || '—',
            entry.score,
            entry.correctAnswers,
            entry.attempted,
            entry.submittedAt ? formatTime(entry.submittedAt) : '—'
        ]);

        autoTable(doc, {
            head: [['Rank', 'Participant', 'Roll No', 'Score', 'Correct', 'Attempted', 'Submitted At']],
            body: tableData,
            startY: 20
        });

        doc.save(`quiz-leaderboard-${eventId}.pdf`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
                <p className="text-gray-500 dark:text-gray-400">Loading quiz leaderboard...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <Link to="/admin/events">
                <Button variant="ghost" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Quiz Studio
                </Button>
            </Link>

            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <Trophy className="h-8 w-8 text-yellow-300" />
                            <div>
                                <CardTitle className="text-2xl font-black text-white">Quiz Leaderboard</CardTitle>
                                <p className="text-emerald-100 text-sm mt-0.5">Admin View • Private Rankings</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fetchLeaderboard(false)}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={handleDownloadCSV}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                CSV
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                PDF
                            </button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {error ? (
                        <div className="text-center py-16 text-red-500">
                            <p className="font-semibold">{error}</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-20 space-y-3">
                            <Medal className="h-14 w-14 text-gray-300 mx-auto" />
                            <p className="text-gray-500 font-medium">No submissions yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 uppercase text-xs font-semibold tracking-wide border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4">Rank</th>
                                        <th className="px-6 py-4">Participant</th>
                                        <th className="px-6 py-4">Roll Number</th>
                                        <th className="px-6 py-4 text-center">Score</th>
                                        <th className="px-6 py-4 text-center">Correct</th>
                                        <th className="px-6 py-4">Submitted At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {leaderboard.map((entry, idx) => (
                                        <tr key={entry.userId} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                            <td className="px-6 py-4 font-bold">{idx + 1}</td>
                                            <td className="px-6 py-4 font-semibold">{entry.username || entry.userId}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{entry.rollNumber || '—'}</td>
                                            <td className="px-6 py-4 text-center text-indigo-600 font-bold">{entry.score}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-bold">
                                                    {entry.correctAnswers} / {entry.attempted}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">{formatTime(entry.submittedAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
