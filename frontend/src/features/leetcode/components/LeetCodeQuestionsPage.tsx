import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { ExternalLink, Code2, Search, Trophy, Settings } from 'lucide-react';
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
}

export default function LeetCodeQuestionsPage() {
    const { isStaff } = useAuth();
    const [questions, setQuestions] = useState<LcQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchQuestions = async () => {
        try {
            const response = await api.get('/leetcode/questions');
            setQuestions(response.data);
        } catch (error) {
            console.error('Failed to fetch questions', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const filteredQuestions = questions.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return <LeetCodeQuestionsSkeleton />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header: Title and Search side by side */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Code2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Questions</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Master LeetCode challenges</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            type="text"
                            placeholder="Find a problem..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link to="/leetcode/leaderboard" className="flex-1 sm:flex-none">
                            <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                                Leaderboard
                            </Button>
                        </Link>
                        {isStaff && (
                            <Link to="/admin/leetcode" className="flex-1 sm:flex-none">
                                <Button variant="primary" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all">
                                    <Settings className="h-4 w-4 mr-2" />
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Card className="group overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all duration-200">
                                <div className="flex flex-col sm:flex-row items-center">
                                    {/* Left: Metadata */}
                                    <div className="p-5 flex-1 min-w-0 w-full">
                                        <div className="flex items-start justify-between sm:justify-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                                        q.difficulty === 'Easy'
                                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
                                                            : q.difficulty === 'Medium'
                                                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-800'
                                                                : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800'
                                                    }`}>
                                                        {q.difficulty}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                                                        {q.topic}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate pr-4">
                                                    {q.title}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: CTA */}
                                    <div className="px-5 py-4 sm:py-5 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 min-w-[140px] w-full sm:w-auto flex items-center justify-center">
                                        <a
                                            href={q.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full"
                                        >
                                            <Button className="w-full h-10 rounded-lg font-bold text-xs uppercase tracking-widest bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all">
                                                <span>Solve Now</span>
                                                <ExternalLink className="h-3.5 w-3.5 ml-2" />
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
