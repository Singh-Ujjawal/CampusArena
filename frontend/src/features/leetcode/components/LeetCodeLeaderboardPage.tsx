import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Trophy, Medal, Search, ArrowLeft, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type LcLeaderboardEntry } from '@/features/leetcode/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LeetCodeLeaderboardSkeleton } from '@/components/skeleton';

export default function LeetCodeLeaderboardPage() {
    const [entries, setEntries] = useState<LcLeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/leetcode/leaderboard');
                setEntries(response.data);
            } catch (error) {
                console.error("Failed to fetch LeetCode leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const filteredEntries = entries.filter(entry =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.leetCodeUsername.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return <LeetCodeLeaderboardSkeleton />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Back Button */}
            <Link 
                to="/profile" 
                className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 w-fit"
            >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-bold text-xs uppercase tracking-wider">Back to Profile</span>
            </Link>

            {/* Header: Title and Search side by side */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Leaderboard</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">LeetCode Arena Standings</p>
                    </div>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search coders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Expanded List Format */}
            <div className="flex flex-col gap-4">
                {filteredEntries.map((entry, index) => {
                    const rank = index + 1;
                    const isTop3 = rank <= 3;
                    
                    return (
                        <Card key={entry.userId} className="overflow-hidden hover:shadow-md transition-all border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <Link to={`/profile/${entry.userId}`} className="flex flex-col md:flex-row items-center">
                                {/* Rank Section */}
                                <div className={`w-full md:w-24 p-4 md:p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 ${
                                    rank === 1 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : 
                                    rank === 2 ? 'bg-gray-50/50 dark:bg-gray-800/10' : 
                                    rank === 3 ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
                                }`}>
                                    <div className="flex flex-col items-center">
                                        {rank === 1 ? (
                                            <Trophy className="h-6 w-6 text-yellow-500 mb-1" />
                                        ) : rank === 2 ? (
                                            <Medal className="h-6 w-6 text-gray-400 mb-1" />
                                        ) : rank === 3 ? (
                                            <Medal className="h-6 w-6 text-orange-500 mb-1" />
                                        ) : (
                                            <span className="text-gray-300 dark:text-gray-600 font-black text-xl mb-1">#</span>
                                        )}
                                        <span className={`text-2xl font-black ${
                                            rank === 1 ? 'text-yellow-600' : 
                                            rank === 2 ? 'text-gray-600' : 
                                            rank === 3 ? 'text-orange-600' : 
                                            'text-gray-400 dark:text-gray-500'
                                        }`}>
                                            {rank}
                                        </span>
                                    </div>
                                </div>

                                {/* User Info Section */}
                                <div className="flex-1 p-5 md:p-6 flex items-center gap-4 w-full">
                                    <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-500 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                                        {entry.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate uppercase tracking-tight">
                                            {entry.name}
                                        </h3>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mt-0.5">
                                            <Code2 className="h-3.5 w-3.5" />
                                            @{entry.leetCodeUsername}
                                        </p>
                                    </div>
                                </div>

                                {/* Stats Section */}
                                <div className="bg-gray-50/50 dark:bg-gray-800/30 p-5 md:p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 min-w-[180px] w-full md:w-auto">
                                    <div className="text-center">
                                        <span className={`text-4xl font-black ${isTop3 ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {entry.totalSolved}
                                        </span>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Problems Solved</p>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-1000"
                                            style={{ width: `${Math.min(100, (entry.totalSolved / (entries[0]?.totalSolved || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    );
                })}

                {filteredEntries.length === 0 && (
                    <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                        <Search className="h-12 w-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">No coders found matching your search</p>
                        <button onClick={() => setSearchQuery('')} className="mt-2 text-blue-600 font-bold hover:underline">Clear search</button>
                    </div>
                )}
            </div>
        </div>
    );
}
