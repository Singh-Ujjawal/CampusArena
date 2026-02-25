import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const IST_TZ = 'Asia/Kolkata';

interface Submission {
    id: string;
    userId: string;
    contestId: string;
    problemId: string;
    language: string;
    verdict: string;
    score: number;
    submittedAt: string;
    code: string;
}

function VerdictBadge({ verdict }: { verdict: string }) {
    if (verdict === 'ACCEPTED') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" /> Accepted
            </span>
        );
    }
    if (verdict === 'PENDING') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                <Clock className="h-3 w-3" /> Pending
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
            <XCircle className="h-3 w-3" /> {verdict.replace('_', ' ')}
        </span>
    );
}

export default function MySubmissionsPage() {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!user) return;
            try {
                const res = await api.get(`/api/submissions/user/${user.id}`);
                // Sort newest first
                const sorted = (res.data as Submission[]).sort(
                    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                );
                setSubmissions(sorted);
            } catch {
                // ignore
            } finally {
                setIsLoading(false);
            }
        };
        fetchSubmissions();
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">My Submissions</h1>

            {submissions.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No submissions yet. Go solve some problems!
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {submissions.map(sub => (
                        <Card
                            key={sub.id}
                            className={`transition-shadow hover:shadow-md ${sub.verdict === 'ACCEPTED' ? 'border-green-200 dark:border-green-800' : ''}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <VerdictBadge verdict={sub.verdict} />
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-mono uppercase">
                                                {sub.language}
                                            </span>
                                            {sub.verdict === 'ACCEPTED' && (
                                                <span className="text-xs text-green-700 dark:text-green-400 font-medium">Score: {sub.score}</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                                            <span>
                                                Contest:{' '}
                                                <Link
                                                    to={`/contests/${sub.contestId}`}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                                >
                                                    {sub.contestId.slice(0, 8)}…
                                                </Link>
                                            </span>
                                            <span>
                                                Problem:{' '}
                                                <Link
                                                    to={`/contests/${sub.contestId}/problem/${sub.problemId}`}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                                >
                                                    {sub.problemId.slice(0, 8)}…
                                                </Link>
                                            </span>
                                            <span>
                                                {new Date(sub.submittedAt).toLocaleString('en-IN', { timeZone: IST_TZ })}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline self-start sm:self-center whitespace-nowrap"
                                    >
                                        {expandedId === sub.id ? 'Hide Code ▲' : 'View Code ▼'}
                                    </button>
                                </div>

                                {expandedId === sub.id && (
                                    <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                                        <div className="bg-gray-800 dark:bg-gray-900 text-gray-300 dark:text-gray-400 text-xs px-3 py-1.5 font-mono">
                                            {sub.language}
                                        </div>
                                        <pre className="bg-gray-900 dark:bg-gray-950 text-green-300 dark:text-green-400 text-xs p-4 overflow-x-auto whitespace-pre-wrap break-words max-h-80">
                                            {sub.code}
                                        </pre>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
