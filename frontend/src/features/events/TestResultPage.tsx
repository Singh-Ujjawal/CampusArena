import { useLocation, Link, Navigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trophy, Loader2, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import FeedbackForm from '@/features/registration/FeedbackForm';
import { motion, AnimatePresence } from 'framer-motion';

export default function TestResultPage() {
    const { eventId } = useParams();
    const { user } = useAuth();
    const location = useLocation();
    const [result, setResult] = useState(location.state?.result);
    const [isLoading, setIsLoading] = useState(!result);
    const [associatedFormId, setAssociatedFormId] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        if (!result && eventId && user) {
            const fetchResult = async () => {
                try {
                    const response = await api.get(`/api/events/${eventId}/result`, {
                        params: { userId: user.id }
                    });

                    setResult(response.data);
                } catch (error) {
                    console.error("Failed to fetch result");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchResult();
        }

        if (eventId) {
            const fetchFormInfo = async () => {
                try {
                    const response = await api.get(`/api/registration/forms/event/${eventId}`);
                    if (response.data && response.data.feedbackEnabled) {
                        setAssociatedFormId(response.data.id);
                        // Show feedback form automatically or via button? 
                        // Let's show it after a small delay or if they click.
                    }
                } catch (error) {
                    console.error("Failed to fetch associated form");
                }
            };
            fetchFormInfo();
        }
    }, [eventId, user, result]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
    }

    if (!result) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg text-center">
                <CardHeader className="flex flex-col items-center">
                    <div className="h-20 w-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                        <Trophy className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <CardTitle className="text-3xl">Test Completed!</CardTitle>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Your submission has been recorded.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex flex-col items-center">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.correctAnswers || 0}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Correct</span>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex flex-col items-center">
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mb-2" />
                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.wrongAnswers || 0}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Wrong</span>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg">
                        <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 uppercase tracking-wide">Total Score</p>
                        <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{result.score}</p>
                        {result.rank && <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">Rank: #{result.rank}</p>}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    {associatedFormId && !showFeedback && (
                        <Button 
                            variant="outline" 
                            className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            onClick={() => setShowFeedback(true)}
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Give Event Feedback
                        </Button>
                    )}
                    
                    <Link to="/dashboard" className="w-full">
                        <Button className="w-full" size="lg">Return to Dashboard</Button>
                    </Link>
                </CardFooter>
            </Card>

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
