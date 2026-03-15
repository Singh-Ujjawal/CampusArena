import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Contest, type Problem, type Submission } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Clock, Users, Lock, Key, LayoutGrid, ClipboardList, History } from 'lucide-react';
import { toast } from 'sonner';
import { CountdownTimer } from '@/components/CountdownTimer';
import { ContestDetailsSkeleton } from '@/components/skeleton';
import FeedbackForm from '@/features/registration/FeedbackForm';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IST_TZ = 'Asia/Kolkata';

export default function ContestDetailsPage() {
    const { contestId } = useParams();
    const { user } = useAuth();
    const [contest, setContest] = useState<Contest | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());
    const [status, setStatus] = useState<string>('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [passwordEntry, setPasswordEntry] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [isRegistered, setIsRegistered] = useState<string | null>(null);
    const [regFormId, setRegFormId] = useState<string | null>(null);
    const [isCheckingReg, setIsCheckingReg] = useState(true);
    const [activeTab, setActiveTab] = useState<'problems' | 'submissions'>('problems');
    const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
    const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
    const [associatedFormId, setAssociatedFormId] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    useEffect(() => {
        if (contestId && sessionStorage.getItem(`contest_access_${contestId}`)) {
            setHasAccess(true);
        }
    }, [contestId]);

    const handleValidatePassword = async () => {
        if (passwordEntry.length !== 6) {
            toast.error('Enter 6-digit password');
            return;
        }
        setIsValidating(true);
        try {
            const response = await api.post(`/api/contests/${contestId}/validate-password`, null, {
                params: {
                    password: passwordEntry,
                    userId: user?.id
                }
            });
            if (response.data === true) {
                setHasAccess(true);
                sessionStorage.setItem(`contest_access_${contestId}`, passwordEntry);
                toast.success('Access granted!');
            } else {
                toast.error('Invalid password');
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Verification failed';
            toast.error(msg);
        } finally {
            setIsValidating(false);
        }
    };

    useEffect(() => {
        const fetchContestAndProblems = async () => {
            try {
                const response = await api.get(`/api/contests/${contestId}`);
                const contestData = response.data.contest || response.data;
                const contestStatus = response.data.status || '';
                setContest(contestData);
                setStatus(contestStatus);

                // Fetch form info regardless of registrationRequired to check for feedback
                try {
                    const formRes = await api.get(`/api/registration/forms/contest/${contestId}`);
                    if (formRes.data && formRes.data.feedbackEnabled) {
                        setAssociatedFormId(formRes.data.id);
                        
                        // Check if user already submitted feedback
                        if (user) {
                            const statusRes = await api.get(`/api/feedback/${formRes.data.id}/status`);
                            setFeedbackSubmitted(statusRes.data);
                        }
                    }
                } catch (e) {
                    // Form might not exist, that's fine
                }

                if (user) {
                    // Always check registration status if user is logged in
                    api.get(`/api/registration/responses/check`, {
                        params: { contestId, userId: user.id }
                    })
                    .then(res => {
                        const statusStr = res.data?.toString().trim();
                        console.log("Contest Registration Status:", statusStr);
                        setIsRegistered(statusStr);
                    })
                    .catch(() => setIsRegistered(null));
                }

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
                setIsCheckingReg(false);
            }
        };
        if (contestId) fetchContestAndProblems();
    }, [contestId, user]);

    // Fetch user's submissions for this contest
    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!user || !contestId) return;
            setIsLoadingSubmissions(true);
            try {
                const response = await api.get(`/api/submissions/contest/${contestId}/user/${user.id}`);
                const submissions: Submission[] = response.data;
                setMySubmissions(submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
                
                const solved = new Set(
                    submissions
                        .filter(s => s.verdict === 'ACCEPTED')
                        .map(s => s.problemId)
                );
                setSolvedProblemIds(solved);
            } catch {
                // silently ignore
            } finally {
                setIsLoadingSubmissions(false);
            }
        };
        fetchSubmissions();
    }, [user, contestId, activeTab]);

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
                </div>
            </div>

            {/* Feedback Banner at Top if Past and Approved */}
            {associatedFormId && (status === 'PAST' || status === 'ENDED') && isRegistered === 'APPROVED' && !feedbackSubmitted && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Contest Feedback</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Tell us what you thought about this competition.</p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => setShowFeedback(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.05]"
                    >
                        Give Feedback
                    </Button>
                </motion.div>
            )}

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

            {/* Tabs for Problems and Submissions */}
            <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-fit">
                <button
                    onClick={() => setActiveTab('problems')}
                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'problems'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105'
                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <LayoutGrid className="h-4 w-4" /> Problems
                </button>
                <button
                    onClick={() => setActiveTab('submissions')}
                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'submissions'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105'
                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <History className="h-4 w-4" /> My Submissions
                </button>
            </div>

            <div className="grid gap-4">
                {activeTab === 'problems' ? (
                    <>
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
                            {/* Registration CTA for upcoming contests */}
                            {!isCheckingReg && contest.registrationRequired && !isRegistered && (
                                <div className="pt-4">
                                    <Button
                                        onClick={() => regFormId ? navigate(`/registration/forms/${regFormId}`) : toast.error('Registration form not found')}
                                        className="py-4 px-8 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/20"
                                    >
                                        Register Now
                                    </Button>
                                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-2 font-medium">Register before the contest begins!</p>
                                </div>
                            )}
                            {!isCheckingReg && contest.registrationRequired && isRegistered === 'APPROVED' && (
                                <div className="pt-4 flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-bold">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span>You are registered!</span>
                                </div>
                            )}
                            {!isCheckingReg && contest.registrationRequired && isRegistered && isRegistered !== 'APPROVED' && (
                                <div className="pt-4 flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                                    <Clock className="h-5 w-5" />
                                    <span>Registration {isRegistered === 'PENDING' ? 'Pending Approval' : 'Rejected'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : status === 'LIVE' && !hasAccess ? (
                    <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-[2rem] p-12 text-center shadow-sm">
                        <div className="max-w-md mx-auto space-y-6">
                            <div className="bg-indigo-50 dark:bg-indigo-900/40 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 mb-2 shadow-inner">
                                {contest.registrationRequired && !isRegistered ? <Users className="h-10 w-10" /> : <Lock className="h-10 w-10" />}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                                    {contest.registrationRequired && isRegistered !== 'APPROVED' 
                                        ? (isRegistered === 'PENDING' ? 'Registration Pending Approval' : 
                                           isRegistered === 'REJECTED' ? 'Registration Rejected' : 'Register for Contest')
                                        : 'Join the Contest'}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                                    {contest.registrationRequired && isRegistered !== 'APPROVED'
                                        ? (isRegistered === 'PENDING' ? 'Your registration is being reviewed. Please wait for an admin to approve it.' :
                                           isRegistered === 'REJECTED' ? 'Your registration was rejected. You cannot participate in this contest.' :
                                           'You must register using the official form before you can access the contest problems.')
                                        : 'Enter the 6-digit access code to see the problems and start coding.'}
                                </p>
                            </div>
                            <div className="space-y-4">
                                {contest.registrationRequired && isRegistered !== 'APPROVED' ? (
                                    isRegistered && isRegistered !== 'REJECTED' ? (
                                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl text-amber-800 dark:text-amber-300 font-bold">
                                            Status: {isRegistered}
                                        </div>
                                    ) : isRegistered === 'REJECTED' ? (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl text-red-800 dark:text-red-300 font-bold">
                                            Status: Rejected
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => regFormId ? navigate(`/registration/forms/${regFormId}`) : toast.error('Registration form not found')}
                                            className="w-full max-w-[240px] py-6 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
                                        >
                                            Register Now
                                        </Button>
                                    )
                                ) : (
                                    <>
                                        <div className="relative max-w-[240px] mx-auto">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                                            <input
                                                type="text"
                                                maxLength={6}
                                                placeholder="000000"
                                                className="w-full pl-12 pr-4 py-4 text-2xl font-black tracking-[0.3em] text-center border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:bg-gray-900 dark:text-white"
                                                value={passwordEntry}
                                                onChange={e => setPasswordEntry(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                onKeyDown={e => e.key === 'Enter' && handleValidatePassword()}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleValidatePassword}
                                            isLoading={isValidating}
                                            className="w-full max-w-[240px] py-6 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
                                        >
                                            Access Problems
                                        </Button>
                                    </>
                                )}
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
                    </>
                ) : (
                    // Submissions Tab Content
                    <div className="space-y-4">
                        {isLoadingSubmissions ? (
                            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-20 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-gray-500 font-medium">Loading your submissions...</p>
                            </div>
                        ) : mySubmissions.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-20 text-center shadow-sm border border-gray-100 dark:border-gray-700 border-2 border-dashed">
                                <ClipboardList className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">No submissions yet</h3>
                                <p className="text-gray-500 mt-1 max-w-xs mx-auto">Pick a problem and start coding to see your history here!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {mySubmissions.map((sub) => {
                                    const problem = problems.find(p => p.id === sub.problemId);
                                    const isExpanded = expandedSubmissionId === sub.id;
                                    const isAccepted = sub.verdict === 'ACCEPTED';
                                    
                                    return (
                                        <div 
                                            key={sub.id} 
                                            className={`bg-white dark:bg-gray-800 rounded-[1.5rem] shadow-sm border transition-all ${isAccepted ? 'border-green-100 dark:border-green-900/30' : 'border-gray-100 dark:border-gray-700'}`}
                                        >
                                            <button
                                                onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                                                className="w-full text-left p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black ${isAccepted ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                                        {isAccepted ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                            {problem?.title || 'Unknown Problem'}
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest ${isAccepted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {sub.verdict.replace(/_/g, ' ')}
                                                            </span>
                                                        </h4>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {new Date(sub.submittedAt).toLocaleString('en-IN', { timeZone: IST_TZ })}
                                                            </div>
                                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{sub.language}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                                                    <div className="text-right">
                                                        <div className="text-lg font-black text-gray-900 dark:text-white">{sub.score} <span className="text-[10px] text-gray-400">pts</span></div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Score</div>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                                        View Code
                                                    </div>
                                                </div>
                                            </button>
                                            
                                            {isExpanded && (
                                                <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="relative group">
                                                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button 
                                                                size="sm" 
                                                                variant="secondary" 
                                                                className="h-8 text-xs font-bold rounded-lg shadow-sm"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(sub.code);
                                                                    toast.success('Code copied!');
                                                                }}
                                                            >
                                                                Copy Code
                                                            </Button>
                                                        </div>
                                                        <pre className="bg-gray-900 text-gray-300 p-6 rounded-2xl overflow-x-auto text-sm font-mono border border-gray-800 leading-relaxed">
                                                            {sub.code}
                                                        </pre>
                                                    </div>
                                                    <div className="mt-4 flex justify-end">
                                                        <Link to={`/contests/${contestId}/problem/${sub.problemId}`}>
                                                            <Button size="sm" className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                                                                Open in Editor
                                                            </Button>
                                                        </Link>
                                                    </div>
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

            <AnimatePresence>
                {showFeedback && associatedFormId && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-2xl"
                        >
                            <FeedbackForm 
                                formId={associatedFormId} 
                                onClose={() => setShowFeedback(false)}
                                onSuccess={() => {
                                    setFeedbackSubmitted(true);
                                    setTimeout(() => setShowFeedback(false), 2000);
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
