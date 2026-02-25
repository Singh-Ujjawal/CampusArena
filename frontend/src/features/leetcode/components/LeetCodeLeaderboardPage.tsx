import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Trophy, Medal, Star, Search, Loader2, ArrowLeft, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type LcLeaderboardEntry } from '@/features/leetcode/types';

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
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Crunching LeetCode stats...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header section */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <Trophy className="h-64 w-64 rotate-12" />
                </div>

                <div className="relative z-10 space-y-6">
                    <Link to="/profile" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-semibold text-sm">Back to My Profile</span>
                    </Link>

                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Code2 className="h-10 w-10 text-blue-200" />
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight">LeetCode Arena</h1>
                        </div>
                        <p className="text-blue-100/80 text-lg font-medium max-w-2xl">
                            Track the top coders in our campus. Solve more problems to climb the ranks.
                        </p>
                    </div>

                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
                        <input
                            type="text"
                            placeholder="Search by name or LeetCode username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Top 3 Podium */}
            {filteredEntries.length >= 3 && !searchQuery && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 pb-2">
                    {/* 2nd Place */}
                    <Link to={`/profile/${filteredEntries[1].userId}`} className="order-2 md:order-1 bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 text-center space-y-4 hover:shadow-xl transition-all group scale-95">
                        <div className="relative inline-block">
                            <div className="h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto border-2 border-gray-300">
                                {filteredEntries[1].name[0]}
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                                <Medal className="h-5 w-5 text-gray-700" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase">{filteredEntries[1].name}</h3>
                            <p className="text-gray-500 font-medium">@{filteredEntries[1].leetCodeUsername}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 py-3 px-6 rounded-2xl inline-block">
                            <span className="text-2xl font-black text-gray-700 dark:text-gray-300">{filteredEntries[1].totalSolved}</span>
                            <span className="text-sm font-bold text-gray-400 ml-1 uppercase">Solved</span>
                        </div>
                    </Link>

                    {/* 1st Place */}
                    <Link to={`/profile/${filteredEntries[0].userId}`} className="order-1 md:order-2 bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-xl border-2 border-yellow-400 dark:border-yellow-500/50 text-center space-y-6 hover:shadow-2xl transition-all group relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-black px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <Star className="h-4 w-4 fill-current" />
                            CHAMPION
                        </div>
                        <div className="relative inline-block">
                            <div className="h-32 w-32 bg-yellow-50 dark:bg-yellow-900/20 rounded-3xl flex items-center justify-center text-5xl font-bold mx-auto border-4 border-yellow-200">
                                {filteredEntries[0].name[0]}
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl">
                                <Trophy className="h-6 w-6 text-yellow-900" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-yellow-600 transition-colors uppercase">{filteredEntries[0].name}</h3>
                            <p className="text-gray-500 font-bold">@{filteredEntries[0].leetCodeUsername}</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 py-4 px-8 rounded-2xl inline-block">
                            <span className="text-4xl font-black text-yellow-600">{filteredEntries[0].totalSolved}</span>
                            <span className="text-sm font-bold text-yellow-600/60 ml-2 uppercase">Solved</span>
                        </div>
                    </Link>

                    {/* 3rd Place */}
                    <Link to={`/profile/${filteredEntries[2].userId}`} className="order-3 bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 text-center space-y-4 hover:shadow-xl transition-all group scale-90">
                        <div className="relative inline-block">
                            <div className="h-20 w-20 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto border-2 border-orange-200">
                                {filteredEntries[2].name[0]}
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-orange-200 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                                <Medal className="h-5 w-5 text-orange-700" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase">{filteredEntries[2].name}</h3>
                            <p className="text-gray-500 font-medium">@{filteredEntries[2].leetCodeUsername}</p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/10 py-3 px-6 rounded-2xl inline-block">
                            <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{filteredEntries[2].totalSolved}</span>
                            <span className="text-sm font-bold text-orange-400 ml-1 uppercase">Solved</span>
                        </div>
                    </Link>
                </div>
            )}

            {/* Full Leaderboard Table */}
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Rank</th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Problems Solved</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {filteredEntries.map((entry, index) => (
                                <tr key={entry.userId} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {index < 3 ? (
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {index + 1}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 font-bold ml-3">#{index + 1}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Link to={`/profile/${entry.userId}`} className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 group-hover:scale-110 transition-transform">
                                                {entry.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase">{entry.name}</p>
                                                <p className="text-sm text-gray-500 font-medium">@{entry.leetCodeUsername}</p>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black text-gray-900 dark:text-white">{entry.totalSolved}</span>
                                            <div className="h-1.5 w-24 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600 transition-all duration-1000"
                                                    style={{ width: `${(entry.totalSolved / (entries[0]?.totalSolved || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredEntries.length === 0 && (
                    <div className="p-20 text-center">
                        <Search className="h-12 w-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No matches found for your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
