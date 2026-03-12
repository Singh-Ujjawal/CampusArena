import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Trophy, Medal, Search, ArrowLeft, Code2, FileDown, Star, Users, ChevronRight, TrendingUp, Award, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { type LcLeaderboardEntry } from '@/features/leetcode/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LeetCodeLeaderboardSkeleton } from '@/components/skeleton';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LeetCodeLeaderboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [entries, setEntries] = useState<LcLeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/leetcode/leaderboard');
                setEntries(response.data);
            } catch (error) {
                console.error("Failed to fetch LeetCode leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const handleDownloadPDF = () => {
        if (!entries || entries.length === 0) {
            toast.error("No data available to download");
            return;
        }
        setIsDownloading(true);

        try {
            const doc = new jsPDF();
            const timestamp = new Date().toLocaleString();

            // Header - Match ProfilePage style
            doc.setFillColor(37, 99, 235); // Blue-600
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('LeetCode Arena Standings', 20, 26);
            doc.setFontSize(10);
            doc.text(`Generated on: ${timestamp}`, 140, 26);

            // Table
            autoTable(doc, {
                startY: 50,
                head: [['Rank', 'Coder Name', 'Roll Number', 'LeetCode Username', 'Solved']],
                body: entries.map((entry, index) => [
                    `#${index + 1}`,
                    entry.name || 'N/A',
                    entry.rollNumber || 'N/A',
                    entry.leetCodeUsername || 'N/A',
                    (entry.totalSolved || 0).toString()
                ]),
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235] },
                styles: { fontSize: 9, cellPadding: 4 },
                margin: { top: 40 }
            });

            const fileName = `LeetCode_Leaderboard_${new Date().getTime()}.pdf`;
            doc.save(fileName);
            toast.success('Leaderboard PDF downloaded!');
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const filteredEntries = entries.filter(entry =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.leetCodeUsername && entry.leetCodeUsername.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (entry.rollNumber && entry.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isLoading) {
        return <LeetCodeLeaderboardSkeleton />;
    }

    const podiumEntries = entries.slice(0, 3);
    const tableEntries = filteredEntries;
    const currentUserEntry = entries.find(e => e.userId === user?.id);
    const currentUserRank = entries.findIndex(e => e.userId === user?.id) + 1;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Redesigned Compact Header */}
            <div className="relative bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group">
                <div className="absolute -right-24 -top-24 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                            <Trophy className="h-5 w-5" />
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                Contest <span className="text-indigo-600 dark:text-indigo-400">Leaderboard</span>
                            </h1>
                            <Button
                                onClick={handleDownloadPDF}
                                disabled={isDownloading || entries.length === 0}
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">Download PDF</span>
                                <FileDown className={`h-4 w-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search by name, ID or roll number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-sm bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/10"
                        />
                    </div>
                </div>
            </div>



            {/* Leaderboard Table: Professional Contest UI */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="py-5 px-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Rank</th>
                                <th className="py-5 px-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Contestant</th>
                                <th className="py-5 px-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Roll Number</th>
                                <th className="py-5 px-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-center">Solved</th>
                                <th className="py-5 px-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Efficiency</th>
                                <th className="py-5 px-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {tableEntries.map((entry, index) => {
                                const rank = index + 1;
                                const isCurrentUser = entry.userId === user?.id;
                                const maxSolved = entries[0]?.totalSolved || 1;
                                const efficiency = Math.round((entry.totalSolved / maxSolved) * 100);

                                return (
                                    <tr 
                                        key={entry.userId} 
                                        onClick={() => navigate(`/profile/${entry.userId}`)}
                                        className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all duration-300 cursor-pointer ${isCurrentUser ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''}`}
                                    >
                                        <td className="py-4 px-6">
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-black ${
                                                rank === 1 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' :
                                                rank === 2 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400' :
                                                rank === 3 ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400' :
                                                'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                                            }`}>
                                                {rank}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                                                    {entry.name[0]}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {entry.name}
                                                        </span>
                                                        {isCurrentUser && <span className="text-[8px] font-black uppercase text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded tracking-widest">You</span>}
                                                        {(entry.course || entry.branch) && (
                                                            <span className="text-[8px] font-black uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded tracking-widest">
                                                                {entry.course} {entry.branch}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <Code2 className="h-3 w-3" />
                                                        @{entry.leetCodeUsername}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-black text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                {entry.rollNumber || '—'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-xl font-black text-slate-800 dark:text-slate-200">{entry.totalSolved}</span>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter -mt-1">Solved</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="w-32">
                                                <div className="flex items-center justify-between mb-1.5 px-0.5">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Potential</span>
                                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{efficiency}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${efficiency}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 transition-all">
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredEntries.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Target className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">No participants found</h4>
                        <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto px-6">We couldn't find any coders matching "{searchQuery}". Try a different name or username.</p>
                        <Button
                            variant="ghost"
                            onClick={() => setSearchQuery('')}
                            className="mt-4 text-indigo-600 font-black uppercase text-xs tracking-[0.2em] hover:bg-transparent hover:underline"
                        >
                            Reset Search
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
