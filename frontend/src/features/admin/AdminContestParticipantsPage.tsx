import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type User, type Submission, type Contest } from '@/types';
import {
    Users,
    ChevronLeft,
    Search,
    Download,
    ExternalLink,
    CheckCircle2,
    Clock,
    Trophy,
    FileCode
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AdminContestParticipantsPageSkeleton } from '@/components/skeleton';

interface ParticipantData {
    user: User;
    submissionCount: number;
    lastSubmission: string;
    bestScore: number;
    status: 'ACTIVE' | 'SUBMITTED';
}

export default function AdminContestParticipantsPage() {
    const { contestId } = useParams<{ contestId: string }>();
    const [contest, setContest] = useState<Contest | null>(null);
    const [participants, setParticipants] = useState<ParticipantData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (contestId) {
            fetchData();
        }
    }, [contestId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Contest Details
            const contestRes = await api.get(`/api/contests/${contestId}`);
            setContest(contestRes.data);

            // 2. Fetch Submissions for this contest
            const submissionsRes = await api.get(`/api/submissions/contest/${contestId}`);
            const submissions: Submission[] = submissionsRes.data;

            // 3. Fetch All Users to get details (or fetch individually if needed, but getAll is simpler for now)
            const usersRes = await api.get('/user');
            const allUsers: User[] = usersRes.data;
            const usersMap = new Map(allUsers.map(u => [u.id, u]));

            // 4. Group submissions by userId
            const userSubmissions = new Map<string, { count: number, last: string, best: number }>();

            submissions.forEach(sub => {
                const current = userSubmissions.get(sub.userId) || { count: 0, last: sub.submittedAt, best: 0 };
                userSubmissions.set(sub.userId, {
                    count: current.count + 1,
                    last: new Date(sub.submittedAt) > new Date(current.last) ? sub.submittedAt : current.last,
                    best: Math.max(current.best, sub.score || 0)
                });
            });

            // 5. Build Participant List
            const participantList: ParticipantData[] = [];
            userSubmissions.forEach((data, userId) => {
                const user = usersMap.get(userId);
                if (user) {
                    participantList.push({
                        user,
                        submissionCount: data.count,
                        lastSubmission: data.last,
                        bestScore: data.best,
                        status: 'SUBMITTED'
                    });
                }
            });

            // Sort by best score descending
            setParticipants(participantList.sort((a, b) => b.bestScore - a.bestScore));
        } catch (error) {
            console.error(error);
            toast.error('Failed to load participant data');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredParticipants = participants.filter(p =>
        p.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        if (!participants.length) return;

        const headers = ['Full Name', 'Username', 'Email', 'Course', 'Branch', 'Submissions', 'Best Score', 'Last Submission'];
        const rows = participants.map(p => [
            `${p.user.firstName} ${p.user.lastName}`,
            p.user.username,
            p.user.email,
            p.user.course,
            p.user.branch,
            p.submissionCount,
            p.bestScore,
            new Date(p.lastSubmission).toLocaleString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `participants_${contest?.title || 'contest'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return <AdminContestParticipantsPageSkeleton />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Link to="/admin/contests" className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group">
                        <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Contests
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                        Contest Participants
                    </h1>
                    <p className="text-gray-500 dark:text-gray-300 font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {contest?.title} • {participants.length} Active Participants
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={exportToCSV}
                        className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Users className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Participants</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{participants.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                        <FileCode className="h-7 w-7 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Submissions</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
                            {participants.reduce((acc, p) => acc + p.submissionCount, 0)}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="h-14 w-14 bg-yellow-50 rounded-2xl flex items-center justify-center">
                        <Trophy className="h-7 w-7 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Avg. Score</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
                            {participants.length > 0
                                ? (participants.reduce((acc, p) => acc + p.bestScore, 0) / participants.length).toFixed(1)
                                : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or username..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl text-sm focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Participant</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">ACADEMIC INFO</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Submissions</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Best Score</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">LAST SUBMISSION</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filteredParticipants.map((p) => (
                                <tr key={p.user.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                                                {p.user.firstName[0]}{p.user.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100">{p.user.firstName} {p.user.lastName}</p>
                                                <p className="text-xs text-gray-500">{p.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-700">{p.user.course}</p>
                                        <p className="text-xs text-gray-400 font-medium">{p.user.branch}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-50 text-purple-600">
                                            {p.submissionCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-600">
                                            {p.bestScore} pts
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            {new Date(p.lastSubmission).toLocaleString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/admin/submissions?userId=${p.user.id}&contestId=${contestId}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                                        >
                                            View Code
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredParticipants.length === 0 && (
                        <div className="py-20 text-center space-y-3">
                            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                <Search className="h-10 w-10 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-bold text-lg">No participants found matching your search</p>
                            <p className="text-gray-400 text-sm">Try searching by name, email, or course</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
