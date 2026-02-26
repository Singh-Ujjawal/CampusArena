import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Play, CheckCircle2, XCircle, Clock, AlertTriangle,
    Zap, Code2, Terminal, Database, Trophy, ChevronLeft,
    ArrowRight, Users, Lock, Key, ListFilter, ClipboardList, History
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import { CountdownTimer } from '@/components/CountdownTimer';
import { type Contest, type Problem, type Submission } from '@/types';
import { ProblemDetailsSkeleton } from '@/components/skeleton';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExecutionResult {
    verdict: string;
    score?: number;
    executionTime: number | null;
    passedTestCases: number | null;
    totalTestCases: number | null;
    failedTestCase: number | null;
    compileError: string | null;
    stderr: string | null;
    stdout?: string | null;
}

// ── Verdict config ────────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<string, {
    label: string;
    icon: React.ReactNode;
    borderClass: string;
    bgClass: string;
    textClass: string;
    badgeClass: string;
}> = {
    ACCEPTED: {
        label: 'Accepted',
        icon: <CheckCircle2 className="h-4 w-4" />,
        borderClass: 'border-l-green-500',
        bgClass: 'bg-green-50 dark:bg-green-900/20',
        textClass: 'text-green-700 dark:text-green-300',
        badgeClass: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200',
    },
    WRONG_ANSWER: {
        label: 'Wrong Answer',
        icon: <XCircle className="h-4 w-4" />,
        borderClass: 'border-l-red-500',
        bgClass: 'bg-red-50 dark:bg-red-900/20',
        textClass: 'text-red-700 dark:text-red-300',
        badgeClass: 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200',
    },
    COMPILE_ERROR: {
        label: 'Compile Error',
        icon: <Code2 className="h-4 w-4" />,
        borderClass: 'border-l-orange-500',
        bgClass: 'bg-orange-50 dark:bg-orange-900/20',
        textClass: 'text-orange-700 dark:text-orange-300',
        badgeClass: 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-200',
    },
    RUNTIME_ERROR: {
        label: 'Runtime Error',
        icon: <Terminal className="h-4 w-4" />,
        borderClass: 'border-l-yellow-500',
        bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
        textClass: 'text-yellow-700 dark:text-yellow-300',
        badgeClass: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200',
    },
    TIME_LIMIT_EXCEEDED: {
        label: 'Time Limit Exceeded',
        icon: <Clock className="h-4 w-4" />,
        borderClass: 'border-l-purple-500',
        bgClass: 'bg-purple-50 dark:bg-purple-900/20',
        textClass: 'text-purple-700 dark:text-purple-300',
        badgeClass: 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200',
    },
    MEMORY_LIMIT_EXCEEDED: {
        label: 'Memory Limit Exceeded',
        icon: <Database className="h-4 w-4" />,
        borderClass: 'border-l-pink-500',
        bgClass: 'bg-pink-50 dark:bg-pink-900/20',
        textClass: 'text-pink-700 dark:text-pink-300',
        badgeClass: 'bg-pink-100 dark:bg-pink-800 text-pink-700 dark:text-pink-200',
    },
};

const getVerdictCfg = (verdict: string) =>
    VERDICT_CONFIG[verdict] ?? {
        label: verdict.replace(/_/g, ' '),
        icon: <AlertTriangle className="h-4 w-4" />,
        borderClass: 'border-l-gray-400',
        bgClass: 'bg-gray-50 dark:bg-gray-900/20',
        textClass: 'text-gray-700 dark:text-gray-300',
        badgeClass: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    };

// ── Language definitions ───────────────────────────────────────────────────────

const LANGUAGES = [
    { value: 'cpp', label: 'C++', monaco: 'cpp' },
    { value: 'c', label: 'C', monaco: 'c' },
    { value: 'java', label: 'Java', monaco: 'java' },
    { value: 'python', label: 'Python', monaco: 'python' },
    { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
];

const DEFAULT_CODE: Record<string, string> = {
    cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    \n    return 0;\n}',
    c: '#include <stdio.h>\nint main() {\n    \n    return 0;\n}',
    java: 'public class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
    python: '# Python 3.11\n',
    javascript: '// Node.js 20\n',
};

// ── Result panel (shared by Run and Submit) ───────────────────────────────────

function ResultPanel({ result, isRun }: { result: ExecutionResult; isRun: boolean }) {
    const cfg = getVerdictCfg(result.verdict);
    const showTestStats = result.totalTestCases != null && result.passedTestCases != null;

    return (
        <Card className={`border-l-4 ${cfg.borderClass} border border-gray-200 dark:border-gray-700 ${cfg.bgClass}`}>
            <div className="p-4 space-y-3">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className={`flex items-center gap-2 font-bold text-sm ${cfg.textClass}`}>
                        {cfg.icon}
                        <span>{isRun ? 'Sample Run: ' : 'Verdict: '}{cfg.label}</span>
                    </div>

                    {/* Stat chips */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Test cases passed */}
                        {showTestStats && (
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badgeClass}`}>
                                <CheckCircle2 className="h-3 w-3" />
                                {result.passedTestCases}/{result.totalTestCases} {isRun ? 'Samples' : 'Tests'} Passed
                            </span>
                        )}

                        {/* Execution time */}
                        {result.executionTime != null && result.executionTime > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                <Zap className="h-3 w-3" />
                                {result.executionTime} ms
                            </span>
                        )}

                        {/* Score — only on accepted submits */}
                        {!isRun && result.verdict === 'ACCEPTED' && result.score != null && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200">
                                Score: {result.score}
                            </span>
                        )}
                    </div>
                </div>

                {/* Failed test case */}
                {result.failedTestCase != null && (
                    <p className={`text-xs ${cfg.textClass}`}>
                        Failed on <strong>Test Case #{result.failedTestCase}</strong>
                    </p>
                )}

                {/* Compile error */}
                {result.compileError && (
                    <div>
                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase mb-1 flex items-center gap-1">
                            <Code2 className="h-3 w-3" /> Compiler Output
                        </p>
                        <pre className="text-xs bg-gray-900 text-orange-300 p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-words border border-orange-500/30 max-h-44">
                            {result.compileError}
                        </pre>
                    </div>
                )}

                {/* Runtime stderr */}
                {result.stderr && !result.compileError && (
                    <div>
                        <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase mb-1 flex items-center gap-1">
                            <Terminal className="h-3 w-3" /> Runtime Output
                        </p>
                        <pre className="text-xs bg-gray-900 text-yellow-300 p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-words border border-yellow-500/30 max-h-44">
                            {result.stderr}
                        </pre>
                    </div>
                )}

                {/* Sample-run stdout (actual output) for wrong answer */}
                {isRun && result.stdout && result.verdict === 'WRONG_ANSWER' && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                            Your Output
                        </p>
                        <pre className="text-xs bg-gray-900 text-gray-300 p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-words border border-gray-600 max-h-44">
                            {result.stdout}
                        </pre>
                    </div>
                )}
            </div>
        </Card>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProblemDetailsPage() {
    const { contestId, problemId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [problem, setProblem] = useState<Problem | null>(null);
    const [contest, setContest] = useState<Contest | null>(null);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState(DEFAULT_CODE['cpp']);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [runResult, setRunResult] = useState<ExecutionResult | null>(null);
    const [submitResult, setSubmitResult] = useState<ExecutionResult | null>(null);
    const [alreadySolved, setAlreadySolved] = useState(false);
    const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
    const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
    const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);

    const [isLoadingAccess, setIsLoadingAccess] = useState(true);

    // ── Fetch problem & contest ───────────────────────────────────────────────

    useEffect(() => {
        if (!contestId) return;
        const checkAccess = () => {
            const hasAccess = sessionStorage.getItem(`contest_access_${contestId}`);
            if (!hasAccess) {
                // If it's live, we MUST have a password. 
                // We'll let the user fetch the contest first to see if it's LIVE.
            }
        };
        checkAccess();
    }, [contestId]);

    useEffect(() => {
        if (contest && contest.status === 'LIVE') {
            const hasAccess = sessionStorage.getItem(`contest_access_${contestId}`);
            if (!hasAccess) {
                toast.error('Please enter the contest password first.');
                navigate(`/contests/${contestId}`);
            } else {
                setIsLoadingAccess(false);
            }
        } else if (contest) {
            setIsLoadingAccess(false);
        }
    }, [contest, contestId, navigate]);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await api.get(`/api/problems/${problemId}`);
                setProblem(res.data);
            } catch {
                toast.error('Failed to load problem');
            }
        };
        const fetchContest = async () => {
            try {
                const res = await api.get(`/api/contests/${contestId}`);
                setContest(res.data.contest || res.data);
            } catch {
                console.error('Failed to fetch contest');
            }
        };
        if (problemId) fetchProblem();
        if (contestId) fetchContest();
    }, [problemId, contestId]);

    // Check if already solved
    useEffect(() => {
        const check = async () => {
            if (!user || !problemId || !contestId) return;
            setIsLoadingSubmissions(true);
            try {
                const res = await api.get(`/api/submissions/contest/${contestId}/user/${user.id}`);
                const allSubs: Submission[] = res.data;
                const problemSubs = allSubs.filter(s => s.problemId === problemId);
                setMySubmissions(problemSubs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
                
                const solved = problemSubs.some(s => s.verdict === 'ACCEPTED');
                setAlreadySolved(solved);
                if (solved && !submitResult) {
                    // Try to find the first accepted one to show initial "Solved" result if needed
                    // But maybe just keeping alreadySolved is enough
                }
            } catch { /* ignore */ } finally {
                setIsLoadingSubmissions(false);
            }
        };
        check();
    }, [user, problemId, contestId]);

    // ── Language switch ───────────────────────────────────────────────────────

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        setCode(DEFAULT_CODE[lang] ?? '');
        setRunResult(null);
        setSubmitResult(null);
    };

    // ── Run (sample tests only) ───────────────────────────────────────────────

    const handleRun = async () => {
        if (!user) return;
        setIsRunning(true);
        setRunResult(null);
        try {
            const res = await api.post('/api/submissions/run', {
                userId: user.id,
                contestId,
                problemId,
                code,
                language,
            });
            const d = res.data;
            setRunResult({
                verdict: d.verdict,
                executionTime: d.executionTime,
                passedTestCases: d.passedTestCases,
                totalTestCases: d.totalTestCases,
                failedTestCase: d.failedTestCase,
                compileError: d.compileError,
                stderr: d.stderr,
                stdout: d.stdout,
            });
        } catch (err: any) {
            toast.error('Run failed. Please try again.');
        } finally {
            setIsRunning(false);
        }
    };

    // ── Submit (all test cases) ───────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!user) return;
        if (alreadySolved) { toast.error('You have already solved this problem!'); return; }
        setIsSubmitting(true);
        setSubmitResult(null);
        try {
            const res = await api.post('/api/submissions', {
                userId: user.id,
                contestId,
                problemId,
                code,
                language,
            });
            const d = res.data;
            setSubmitResult({
                verdict: d.verdict,
                score: d.score,
                executionTime: d.executionTime,
                passedTestCases: d.passedTestCases,
                totalTestCases: d.totalTestCases,
                failedTestCase: d.failedTestCase,
                compileError: d.compileError,
                stderr: d.stderr,
            });
            if (d.verdict === 'ACCEPTED') {
                setAlreadySolved(true);
                toast.success('Solution Accepted! 🎉');
            } else {
                toast.error(`${d.verdict.replace(/_/g, ' ')}`);
            }
            // Refresh submissions list
            const subRes = await api.get(`/api/submissions/contest/${contestId}/user/${user.id}`);
            const allSubs: Submission[] = subRes.data;
            setMySubmissions(allSubs.filter(s => s.problemId === problemId).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
        } catch (error: any) {
            if (error?.response?.status === 409) {
                setAlreadySolved(true);
                toast.error('You have already solved this problem!');
            } else if (error?.response?.status === 429) {
                const msg = error?.response?.data?.message || 'Please wait before resubmitting.';
                toast.error(`Rate limit: ${msg}`);
            } else {
                toast.error('Submission failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (!problem || !contest || isLoadingAccess) return <ProblemDetailsSkeleton />;

    const monacoLang = LANGUAGES.find(l => l.value === language)?.monaco ?? 'cpp';

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col p-4 space-y-4">
            {/* ── Navigation Header ── */}
            <div className="flex items-center justify-between flex-shrink-0 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <Link to={`/contests/${contestId}`}>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Contest
                    </Button>
                </Link>

                <Link to={`/leaderboard/${contestId}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 text-indigo-600 border-indigo-100 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-bold">
                        <Trophy className="h-4 w-4" />
                        Live Leaderboard
                    </Button>
                </Link>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">

                {/* ── Problem Description ── */}
                <div className="md:w-1/2 flex flex-col overflow-hidden">
                    <Card className="h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        {/* Tab Headers */}
                        <div className="flex border-b border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab('description')}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'description'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
                                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                <Code2 className="h-4 w-4" /> Description
                            </button>
                            <button
                                onClick={() => setActiveTab('submissions')}
                                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'submissions'
                                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
                                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                <History className="h-4 w-4" /> My Submissions
                                {mySubmissions.length > 0 && (
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full text-[10px]">
                                        {mySubmissions.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'description' ? (
                                <div className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
                                    <h3 className="text-2xl font-black mb-4 flex justify-between items-center">
                                        {problem.title}
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ${problem.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                                                problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {problem.difficulty}
                                        </span>
                                    </h3>
                                    <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br />') }} />

                                    {problem.testCases && problem.testCases.filter(tc => !tc.hidden).length > 0 && (
                                        <div className="mt-8 space-y-4">
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <Terminal className="h-4 w-4 text-gray-400" /> Example Test Cases
                                            </h4>
                                            {problem.testCases?.filter(tc => !tc.hidden).map((tc, idx) => (
                                                <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-sm font-mono border border-gray-100 dark:border-gray-700">
                                                    <div className="mb-3">
                                                        <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Input</span>
                                                        <pre className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">{tc.input}</pre>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Expected Output</span>
                                                        <pre className="whitespace-pre-wrap break-words text-green-600 dark:text-green-400">{tc.expectedOutput}</pre>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100">Pervious Submissions</h4>
                                    </div>
                                    {isLoadingSubmissions ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                            <p className="text-sm">Loading history...</p>
                                        </div>
                                    ) : mySubmissions.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                                            <ClipboardList className="h-12 w-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                                            <p className="text-gray-500 dark:text-gray-400 font-medium italic">No submissions yet. Start coding!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {mySubmissions.map((sub) => {
                                                const subCfg = getVerdictCfg(sub.verdict);
                                                const isExpanded = expandedSubmissionId === sub.id;
                                                return (
                                                    <div key={sub.id} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                        <button
                                                            onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                                                            className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-2 rounded-lg ${subCfg.bgClass} ${subCfg.textClass}`}>
                                                                    {subCfg.icon}
                                                                </div>
                                                                <div className="text-left">
                                                                    <div className={`font-bold text-sm ${subCfg.textClass}`}>{subCfg.label}</div>
                                                                    <div className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {new Date(sub.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-right">
                                                                    <div className="text-xs font-bold text-gray-700 dark:text-gray-200">{sub.score} pts</div>
                                                                    <div className="text-[10px] text-gray-400 dark:text-gray-500">{sub.language}</div>
                                                                </div>
                                                                <ChevronLeft className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? '-rotate-90' : 'rotate-180'}`} />
                                                            </div>
                                                        </button>
                                                        {isExpanded && (
                                                            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source Code</span>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="h-7 text-[10px] py-0 px-2 text-indigo-600 hover:text-indigo-700"
                                                                        onClick={() => {
                                                                            setCode(sub.code);
                                                                            setLanguage(sub.language.toLowerCase());
                                                                            setActiveTab('description'); // Go back to description to see the editor easily
                                                                            toast.success('Code restored to editor');
                                                                        }}
                                                                    >
                                                                        Restore to Editor
                                                                    </Button>
                                                                </div>
                                                                <pre className="text-xs p-3 bg-gray-900 text-gray-300 rounded-lg overflow-x-auto whitespace-pre font-mono border border-gray-800">
                                                                    {sub.code}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* ── Editor + Results ── */}
                <div className="md:w-1/2 flex flex-col gap-3 overflow-y-auto">

                    <Card className="flex flex-col overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        style={{ height: '65%', minHeight: '300px' }}>
                        {/* Toolbar */}
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <select
                                    className="h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm px-2"
                                    value={language}
                                    onChange={e => handleLanguageChange(e.target.value)}
                                >
                                    {LANGUAGES.map(l => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
                                    ))}
                                </select>
                                {contest?.endTime && (
                                    <CountdownTimer
                                        targetDate={contest.endTime}
                                        className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-600"
                                    />
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Run button */}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleRun}
                                    disabled={isRunning || isSubmitting}
                                    className="border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 text-xs"
                                >
                                    {isRunning ? (
                                        <span className="flex items-center gap-1">
                                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Running...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <Play className="h-3 w-3" /> Run
                                        </span>
                                    )}
                                </Button>

                                {/* Submit button */}
                                {alreadySolved ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                                        <CheckCircle2 className="h-3 w-3" /> Solved
                                    </span>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || isRunning}
                                        className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-xs"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-1">
                                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                                Judging...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Play className="h-3 w-3" /> Submit
                                            </span>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Editor */}
                        <div className="flex-1 min-h-0">
                            <Editor
                                height="100%"
                                language={monacoLang}
                                value={code}
                                onChange={val => setCode(val || '')}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                    </Card>

                    {/* Run result */}
                    {runResult && (
                        <ResultPanel result={runResult} isRun={true} />
                    )}

                    {/* Submit result */}
                    {submitResult && (
                        <ResultPanel result={submitResult} isRun={false} />
                    )}
                </div>
            </div>
        </div>
    );
}
