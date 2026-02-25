import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { ExternalLink, Loader2, Code2, Search, AlertCircle, Trophy, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

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
            <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <Code2 className="h-64 w-64 rotate-12" />
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
                                <Code2 className="h-10 w-10 text-blue-200" />
                                LeetCode Arena
                            </h1>
                            <p className="text-blue-100/80 text-lg font-medium max-w-2xl">
                                Master your coding skills. Solve these hand-picked problems on LeetCode and track your progress.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {isStaff && (
                                <Link to="/admin/leetcode">
                                    <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-xl font-bold">
                                        Manage Questions
                                    </Button>
                                </Link>
                            )}
                            {isStaff && (
                                <Link to="/leetcode/leaderboard">
                                    <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold shadow-lg">
                                        <Trophy className="h-4 w-4 mr-2" />
                                        Leaderboard
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
                        <Input
                            type="text"
                            placeholder="Search by title or topic..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-6 pl-12 pr-4 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-white/30 transition-all font-medium border-none"
                        />
                    </div>
                </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuestions.map((q) => (
                    <div
                        key={q.id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group flex flex-col justify-between"
                    >
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-2xl bg-opacity-10 dark:bg-opacity-20 ${q.difficulty === 'Easy' ? 'bg-green-500 text-green-600' :
                                    q.difficulty === 'Medium' ? 'bg-yellow-500 text-yellow-600' :
                                        'bg-red-500 text-red-600'
                                    }`}>
                                    <BrainCircuit className="h-6 w-6" />
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {q.difficulty}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    {q.title}
                                </h3>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{q.topic}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <a
                                href={q.url}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-600 hover:text-white text-gray-700 dark:text-gray-200 py-4 rounded-2xl font-bold transition-all"
                            >
                                Solve Problem <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {filteredQuestions.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-20 text-center border border-gray-100 dark:border-gray-700">
                    <AlertCircle className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">No questions found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto font-medium">
                        Try adjusting your search query or check back later for new challenges.
                    </p>
                </div>
            )}
        </div>
    );
}
