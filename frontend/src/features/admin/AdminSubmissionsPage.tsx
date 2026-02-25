import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock, Search } from 'lucide-react';

import { Link, useSearchParams } from 'react-router-dom';
import { AdminSubmissionsPageSkeleton } from '@/components/skeleton';

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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
            </span>
        );
    }
    if (verdict === 'PENDING') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                <Clock className="h-3.5 w-3.5" /> Pending
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            <XCircle className="h-3.5 w-3.5" /> {verdict.replace('_', ' ')}
        </span>
    );
}

export default function AdminSubmissionsPage() {
    const [searchParams] = useSearchParams();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [filtered, setFiltered] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [search, setSearch] = useState(() => {
        const u = searchParams.get('userId');
        const c = searchParams.get('contestId');
        if (u && c) return `${u} ${c}`;
        return u || c || '';
    });
    const [verdictFilter, setVerdictFilter] = useState('ALL');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await api.get('/api/submissions');

                const sorted = (res.data as Submission[]).sort(
                    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                );
                setSubmissions(sorted);
                setFiltered(sorted);
            } catch {
                // ignore
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Apply filters whenever search or verdictFilter changes
    useEffect(() => {
        let result = submissions;
        if (verdictFilter !== 'ALL') {
            result = result.filter(s => s.verdict === verdictFilter);
        }
        if (search.trim()) {
            const terms = search.trim().toLowerCase().split(/\s+/);
            result = result.filter(s =>
                terms.every(term =>
                    s.userId.toLowerCase().includes(term) ||
                    s.contestId.toLowerCase().includes(term) ||
                    s.problemId.toLowerCase().includes(term) ||
                    s.language.toLowerCase().includes(term)
                )
            );
        }
        setFiltered(result);
    }, [search, verdictFilter, submissions]);

    const stats = {
        total: submissions.length,
        accepted: submissions.filter(s => s.verdict === 'ACCEPTED').length,
        wrong: submissions.filter(s => s.verdict === 'WRONG_ANSWER').length,
    };

    if (isLoading) {
        return <AdminSubmissionsPageSkeleton />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">All Submissions</h1>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</div>
                    </CardContent>
                </Card>
                <Card className="border-green-200 dark:border-green-700 bg-white dark:bg-gray-900">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.accepted}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Accepted</div>
                    </CardContent>
                </Card>
                <Card className="border-red-200 dark:border-red-700 bg-white dark:bg-gray-900">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.wrong}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Wrong Answer</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by user ID, contest ID, problem ID, language…"
                        className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                    value={verdictFilter}
                    onChange={e => setVerdictFilter(e.target.value)}
                >
                    <option value="ALL">All Verdicts</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="WRONG_ANSWER">Wrong Answer</option>
                    <option value="PENDING">Pending</option>
                </select>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} submission{filtered.length !== 1 ? 's' : ''} found</div>

            {/* Submissions list */}
            {filtered.length === 0 ? (
                <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-8 text-center text-gray-500 dark:text-gray-400">No submissions match your filters.</CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filtered.map(sub => (
                        <Card
                            key={sub.id}
                            className={`transition-shadow hover:shadow-md ${sub.verdict === 'ACCEPTED' ? 'border-green-200 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-900`}
                        >
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <VerdictBadge verdict={sub.verdict} />
                                            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-mono uppercase">
                                                {sub.language}
                                            </span>
                                            {sub.verdict === 'ACCEPTED' && (
                                                <span className="text-xs text-green-700 font-medium">Score: {sub.score}</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                                            <span>
                                                User: <span className="font-mono text-xs text-gray-700">{sub.userId.slice(0, 12)}…</span>
                                            </span>
                                            <span>
                                                Contest:{' '}
                                                <Link
                                                    to={`/contests/${sub.contestId}`}
                                                    className="text-indigo-600 hover:underline font-medium"
                                                >
                                                    {sub.contestId.slice(0, 8)}…
                                                </Link>
                                            </span>
                                            <span>
                                                Problem:{' '}
                                                <Link
                                                    to={`/contests/${sub.contestId}/problem/${sub.problemId}`}
                                                    className="text-indigo-600 hover:underline font-medium"
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
                                        className="text-xs text-indigo-600 hover:underline self-start sm:self-center whitespace-nowrap"
                                    >
                                        {expandedId === sub.id ? 'Hide Code ▲' : 'View Code ▼'}
                                    </button>
                                </div>

                                {expandedId === sub.id && (
                                    <div className="mt-3 border rounded-md overflow-hidden">
                                        <div className="bg-gray-800 text-gray-300 text-xs px-3 py-1.5 font-mono">
                                            {sub.language}
                                        </div>
                                        <pre className="bg-gray-900 text-green-300 text-xs p-4 overflow-x-auto whitespace-pre-wrap break-words max-h-80">
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
