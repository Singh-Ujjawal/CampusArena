import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardHeader, CardFooter } from '@/components/ui/card';
import { Loader2, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

// Question from backend — id is returned as 'id', not 'questionId'
interface BackendQuestion {
    id: string;
    questionText: string;
    options: string[];
    marks: number;
    negativeMarks: number;
}

export default function TestInterface() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<BackendQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();

    // Use a ref for isSubmitting to avoid stale closure in timer
    const isSubmittingRef = useRef(false);

    // Fetch Questions (Start Test)
    useEffect(() => {
        const startTest = async () => {
            const searchParams = new URLSearchParams(window.location.search);
            let pass = searchParams.get('pass');
            if (!pass) {
                pass = sessionStorage.getItem(`event_access_${eventId}`);
            }
            try {
                const response = await api.post(`/api/events/${eventId}/start`, null, {
                    params: { userId: user?.id, accessPassword: pass }
                });
                if (Array.isArray(response.data)) {
                    setQuestions(response.data);
                } else if (response.data && typeof response.data === 'object') {
                    const qs = response.data.questions || response.data;
                    setQuestions(Array.isArray(qs) ? qs : []);
                }
                setIsLoading(false);
            } catch (error: any) {
                const msg = error?.response?.data?.message || 'Failed to start test.';
                toast.error(msg);
                navigate(`/events/${eventId}`);
            }
        };
        if (eventId && user?.id) startTest();
    }, [eventId, user?.id, navigate]);

    const handleOptionSelect = (questionId: string | undefined, optionIndex: number) => {
        if (!questionId) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = useCallback(async (_autoSubmit = false) => {
        if (isSubmittingRef.current && !_autoSubmit) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        const answerList = Object.entries(answers).map(([qId, opt]) => ({
            questionId: qId,
            selectedOption: opt
        }));

        try {
            const response = await api.post(`/api/events/${eventId}/submit`, {
                answers: answerList
            }, { params: { userId: user?.id } });
            const result = response.data;
            navigate(`/test/${eventId}/result`, { state: { result } });
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Submission failed. Please try again.';
            toast.error(msg);
            isSubmittingRef.current = false;
            setIsSubmitting(false);
        }
    }, [answers, eventId, navigate, user?.id]);

    const [targetEndTime, setTargetEndTime] = useState<number | null>(null);

    // 1. Initial Sync Effect
    useEffect(() => {
        if (!eventId || !user?.id || isLoading) return;

        const syncTime = async () => {
            try {
                const response = await api.get(`/api/events/${eventId}/remaining-time`, { params: { userId: user?.id } });
                const time = response.data?.remainingSeconds ?? response.data?.remainingTime ?? 0;
                const end = Date.now() + (Number(time) * 1000);
                setTargetEndTime(end);
                setRemainingTime(Math.max(0, Math.floor((end - Date.now()) / 1000)));
            } catch { /* ignore */ }
        };

        syncTime();
        const syncInterval = setInterval(syncTime, 30000);
        return () => clearInterval(syncInterval);
    }, [eventId, user?.id, isLoading]);

    // 2. Ticking Effect
    useEffect(() => {
        if (targetEndTime === null) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, Math.floor((targetEndTime - now) / 1000));
            setRemainingTime(diff);

            if (diff <= 0) {
                clearInterval(interval);
                if (!isSubmittingRef.current) {
                    isSubmittingRef.current = true;
                    handleSubmit(true);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetEndTime, handleSubmit]);

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!questions.length) return <div className="p-10">No questions found.</div>;

    const currentQuestion = questions[currentQuestionIndex];

    // Format Time
    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-[calc(100vh-5rem)] bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10 border-b dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">MCQ Test</h2>
                {remainingTime !== null && (
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border font-mono font-bold transition-all ${remainingTime < 300
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 animate-pulse'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                        <Timer className="h-5 w-5" />
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Time Left</span>
                            <span className="text-xl">{formatTime(remainingTime)}</span>
                        </div>
                    </div>
                )}
                <Button variant="danger" onClick={() => handleSubmit(false)} isLoading={isSubmitting}>
                    Submit Test
                </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Area */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="min-h-[400px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                <span>Question {currentQuestionIndex + 1}</span>
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Marks: {currentQuestion.marks}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-lg text-gray-800 dark:text-gray-100 mb-6">{currentQuestion.questionText}</p>
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = answers[currentQuestion.id] === idx;
                                    return (
                                        <div
                                            key={idx}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors flex items-center select-none ${isSelected
                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-600 ring-1 ring-indigo-500 dark:ring-indigo-600'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                                                }`}
                                            onClick={() => handleOptionSelect(currentQuestion.id, idx)}
                                        >
                                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 flex-shrink-0 ${isSelected ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-600' : 'border-gray-400 dark:border-gray-500'
                                                }`}>
                                                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300">{option}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
                            <Button
                                variant="secondary"
                                disabled={currentQuestionIndex === 0}
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => prev < questions.length - 1 ? prev + 1 : prev)}
                                disabled={currentQuestionIndex === questions.length - 1}
                            >
                                Next
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Navigation Sidebar */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Question Map</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((q, idx) => (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`h-10 w-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${currentQuestionIndex === idx
                                            ? 'bg-indigo-600 dark:bg-indigo-600 text-white'
                                            : answers[q.id] !== undefined
                                                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-6 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                    <div className="h-3 w-3 bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800 rounded mr-2" />
                                    <span>Answered</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-3 w-3 bg-indigo-600 dark:bg-indigo-600 rounded mr-2" />
                                    <span>Current</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-3 w-3 bg-gray-100 dark:bg-gray-700 rounded mr-2" />
                                    <span>Not Answered</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
