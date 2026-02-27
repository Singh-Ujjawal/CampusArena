import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { ExternalLink, Loader2, Code2, Search, AlertCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
            // Updated to the public endpoint accessible by all users
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
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <p className="text-slate-600 dark:text-slate-300 font-medium">Loading LeetCode questions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 dark:from-indigo-700 dark:via-blue-700 dark:to-indigo-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        {/* Title Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 dark:bg-white/10 rounded-full backdrop-blur-md border border-white/20">
                                    <Code2 className="h-5 w-5 text-white" />
                                    <span className="text-white font-bold text-sm uppercase tracking-widest">LeetCode Practice</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                    LeetCode Arena
                                </h1>
                                <p className="text-indigo-100 text-lg font-medium max-w-2xl">
                                    Master your coding skills by solving hand-picked problems from LeetCode
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {isStaff && (
                                    <Link to="/admin/leetcode">
                                        <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-lg font-bold transition-all h-11 px-6">
                                            Manage Questions
                                        </Button>
                                    </Link>
                                )}
                                {isStaff && (
                                    <Link to="/leetcode/leaderboard">
                                        <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold h-11 px-6 transition-all">
                                            <Trophy className="h-4 w-4 mr-2" />
                                            Leaderboard
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-200" />
                            <Input
                                type="text"
                                placeholder="Search by title or topic..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-indigo-200 focus:ring-2 focus:ring-white/50 transition-all font-medium"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Questions List */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {filteredQuestions.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Questions <span className="text-slate-500 dark:text-slate-400 text-lg font-semibold">({filteredQuestions.length})</span>
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {filteredQuestions.map((q, index) => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group"
                                >
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-indigo-900/30 transition-all duration-200 flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                                        {q.title}
                                                    </h3>
                                                    <div className="mt-2 flex items-center gap-3">
                                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                            {q.topic}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
                                                        q.difficulty === 'Easy'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                            : q.difficulty === 'Medium'
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                        {q.difficulty}
                                                    </span>

                                                    <a
                                                        href={q.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white rounded-lg font-bold transition-all whitespace-nowrap"
                                                    >
                                                        <span className="hidden sm:inline">Solve</span>
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-700"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full">
                                <AlertCircle className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No questions found</h3>
                        <p className="text-slate-600 dark:text-slate-400 font-medium max-w-sm mx-auto">
                            Try adjusting your search query or check back later for new challenges.
                        </p>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
