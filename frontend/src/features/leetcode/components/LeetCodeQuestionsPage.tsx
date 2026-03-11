import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { ExternalLink, Code2, Search, Trophy, Settings, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { LeetCodeQuestionsSkeleton } from '@/components/skeleton';

interface LcQuestion {
    id: string;
    title: string;
    url: string;
    difficulty: string;
    topic: string;
    isSolved?: boolean;
}

export default function LeetCodeQuestionsPage() {
    const { user, isStaff } = useAuth();
    const [questions, setQuestions] = useState<LcQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchQuestions = async () => {
        if (!user) return;
        try {
            // Fetch questions and user's LeetCode profile (which contains activity stats)
            const [questionsRes, profileRes] = await Promise.all([
                api.get('/leetcode/questions'),
                api.get(`/leetcode/profile/${user.id}`).catch(() => ({ data: { topicStats: {} } }))
            ]);

            const topicStats = profileRes.data.topicStats || {};
            
            // Heuristic: If question's topic exists in user's solved topic stats, mark as solved
            // The user mentioned checking profile statistics to determine solved status
            const questionsWithStatus = questionsRes.data.map((q: LcQuestion) => ({
                ...q,
                isSolved: !!topicStats[q.topic] && topicStats[q.topic] > 0
            }));

            setQuestions(questionsWithStatus);
        } catch (error) {
            console.error('Failed to fetch questions', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [user]);

    const filteredQuestions = questions.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return <LeetCodeQuestionsSkeleton />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header: Enhanced with Refined Aesthetics */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700" />
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none transform group-hover:scale-105 transition-transform duration-500">
                        <Code2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400">
                            LeetCode Arena
                        </h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                             Challenges to sharpen your skills
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto relative z-10">
                    <div className="relative w-full sm:w-60 md:w-72 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            type="text"
                            placeholder="Find a problem..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link to="/leetcode/leaderboard" className="flex-1 sm:flex-none">
                            <Button variant="outline" className="w-full h-10 px-4 rounded-xl font-bold text-xs border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                <Trophy className="h-3.5 w-3.5 mr-2 text-amber-500" />
                                Leaderboard
                            </Button>
                        </Link>
                        {isStaff && (
                            <Link to="/admin/leetcode" className="flex-1 sm:flex-none">
                                <Button className="w-full h-10 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 dark:shadow-none transition-all">
                                    <Settings className="h-3.5 w-3.5 mr-2" />
                                    Manage
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Questions Grid/List */}
            <div className="grid gap-4">
                {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q, index) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                        >
                            <Card className={`group overflow-hidden border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 ${
                                q.isSolved 
                                    ? 'bg-emerald-50/20 dark:bg-emerald-900/10 border-emerald-100/50 dark:border-emerald-900/30' 
                                    : 'bg-white dark:bg-slate-900'
                            }`}>
                                <div className="flex flex-col sm:flex-row items-center">
                                    {/* Left: Metadata & Title */}
                                    <div className="p-4 flex-1 min-w-0 w-full">
                                        <div className="flex items-start gap-4">
                                            {/* Status Icon */}
                                            <div className="mt-1 flex-shrink-0">
                                                {q.isSolved ? (
                                                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm transition-transform group-hover:scale-110">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    </div>
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-transparent">
                                                        <Circle className="h-3.5 w-3.5" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                                                        q.difficulty === 'Easy'
                                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                                                            : q.difficulty === 'Medium'
                                                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                                                                : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-800'
                                                    }`}>
                                                        {q.difficulty}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-[4px] border border-slate-100 dark:border-slate-700">
                                                        {q.topic}
                                                    </span>
                                                    {q.isSolved && (
                                                        <span className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50/50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-[4px]">
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={`text-lg font-bold transition-colors truncate pr-4 ${
                                                    q.isSolved 
                                                        ? 'text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400' 
                                                        : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                                                }`}>
                                                    {q.title}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: CTA */}
                                    <div className={`px-4 py-3 sm:py-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 min-w-[170px] w-full sm:w-auto h-auto sm:h-24 flex items-center justify-center ${
                                        q.isSolved ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : 'bg-white dark:bg-slate-900'
                                    }`}>
                                        <a
                                            href={q.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full sm:w-auto"
                                        >
                                            <Button className={`w-full sm:w-36 h-9 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                                                q.isSolved
                                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100/50'
                                                    : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700'
                                            }`}>
                                                <span>{q.isSolved ? 'Review' : 'Solve Now'}</span>
                                                <ExternalLink className="h-3.5 w-3.5 ml-2 flex-shrink-0" />
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="bg-slate-50 dark:bg-slate-800/50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No results found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">
                             We couldn't find any questions matching "<strong>{searchQuery}</strong>".
                        </p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold hover:underline underline-offset-4"
                        >
                            Show all questions
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
