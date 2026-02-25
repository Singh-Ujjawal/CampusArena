import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Problem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Play, CheckCircle2, XCircle, Clock, AlertTriangle,
    Zap, Code2, Terminal, Database
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import { CountdownTimer } from '@/components/CountdownTimer';
import { type Contest } from '@/types';
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

    const [problem, setProblem] = useState<Problem | null>(null);
    const [contest, setContest] = useState<Contest | null>(null);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState(DEFAULT_CODE['cpp']);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [runResult, setRunResult] = useState<ExecutionResult | null>(null);
    const [submitResult, setSubmitResult] = useState<ExecutionResult | null>(null);
    const [alreadySolved, setAlreadySolved] = useState(false);

    // ── Fetch problem & contest ───────────────────────────────────────────────

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
            try {
                const res = await api.get(`/api/submissions/user/${user.id}`);
                const solved = (res.data as any[]).some(
                    s => s.problemId === problemId && s.contestId === contestId && s.verdict === 'ACCEPTED'
                );
                setAlreadySolved(solved);
                if (solved) {
                    setSubmitResult({ verdict: 'ACCEPTED', score: 100, executionTime: null, passedTestCases: null, totalTestCases: null, failedTestCase: null, compileError: null, stderr: null });
                }
            } catch { /* ignore */ }
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

    if (!problem) return <ProblemDetailsSkeleton />;

    const monacoLang = LANGUAGES.find(l => l.value === language)?.monaco ?? 'cpp';

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 p-4">

            {/* ── Problem Description ── */}
            <div className="md:w-1/2 flex flex-col overflow-hidden">
                <Card className="h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center text-gray-900 dark:text-gray-100">
                            <span>{problem.title}</span>
                            <span className={`text-sm px-2 py-1 rounded font-semibold ${problem.difficulty === 'EASY' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                                problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                                    'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                                }`}>
                                {problem.difficulty}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
                        <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br />') }} />

                        {problem.testCases && problem.testCases.filter(tc => !tc.hidden).length > 0 && (
                            <div className="mt-6 space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100">Example Test Cases</h4>
                                {problem.testCases?.filter(tc => !tc.hidden).map((tc, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm font-mono border border-gray-200 dark:border-gray-600">
                                        <div className="mb-2">
                                            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase block mb-1">Input:</span>
                                            <pre className="whitespace-pre-wrap break-words">{tc.input}</pre>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase block mb-1">Expected Output:</span>
                                            <pre className="whitespace-pre-wrap break-words">{tc.expectedOutput}</pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
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
    );
}
