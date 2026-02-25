import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { Loader2, RefreshCw, Trophy, ExternalLink, Code2, BrainCircuit, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { type LcUserProfile } from '../types';
import { Button } from '@/components/ui/button';

interface LeetCodeProfileProps {
    userId: string;
    isViewOnly?: boolean;
}

const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes — must match backend

function formatRelativeTime(isoString: string | null): string {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const diff = Date.now() - date.getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
}

function getCooldownRemaining(lastSyncedTimestamp: number | null): number {
    if (!lastSyncedTimestamp) return 0;
    const elapsed = Date.now() - lastSyncedTimestamp;
    return Math.max(0, Math.ceil((COOLDOWN_MS - elapsed) / 1000));
}

export default function LeetCodeProfile({ userId, isViewOnly }: LeetCodeProfileProps) {
    const [profile, setProfile] = useState<LcUserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [cooldownSecs, setCooldownSecs] = useState(0);

    const fetchProfile = useCallback(async () => {
        try {
            const response = await api.get(`/leetcode/profile/${userId}`);
            const data: LcUserProfile = response.data;
            setProfile(data);
            setCooldownSecs(getCooldownRemaining(data.lastSyncedTimestamp));
        } catch (error) {
            console.error('Failed to fetch LeetCode profile', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Countdown ticker — re-evaluates every second while there's a cooldown
    useEffect(() => {
        if (cooldownSecs <= 0) return;
        const timer = setInterval(() => {
            setCooldownSecs(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldownSecs]);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await api.post(`/leetcode/sync/${userId}`);
            const msg = res.data?.message || 'LeetCode submissions synced!';
            toast.success(msg);
            await fetchProfile();
        } catch (error: any) {
            const serverMsg: string =
                error.response?.data?.message ||
                error.response?.data ||
                'Failed to sync LeetCode submissions';
            // Parse cooldown seconds from server message if present
            const match = serverMsg.match(/Please wait (\d+) seconds/i);
            if (match) {
                setCooldownSecs(parseInt(match[1], 10));
            }
            toast.error(serverMsg);
        } finally {
            setIsSyncing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!profile || !profile.leetCodeUsername) {
        return (
            <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <Code2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">LeetCode Not Linked</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                    {isViewOnly
                        ? "This user hasn't linked their LeetCode account yet."
                        : 'Link your LeetCode account in your profile settings to track your progress and compete on the leaderboard.'
                    }
                </p>
                {!isViewOnly && (
                    <p className="text-sm text-blue-600 font-medium">Please update your LeetCode username in the Profile tab.</p>
                )}
            </div>
        );
    }

    const onCooldown = cooldownSecs > 0;
    const cooldownMins = Math.floor(cooldownSecs / 60);
    const cooldownRemSecs = cooldownSecs % 60;
    const cooldownLabel = cooldownMins > 0
        ? `${cooldownMins}m ${cooldownRemSecs}s`
        : `${cooldownSecs}s`;

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                        <Trophy className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Solved</p>
                    <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{profile.totalSolved}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 md:col-span-2 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                {profile.leetCodeUsername}
                                <a
                                    href={`https://leetcode.com/${profile.leetCodeUsername}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">LeetCode Statistics</p>
                        </div>
                        {!isViewOnly && (
                            <Button
                                onClick={handleSync}
                                disabled={isSyncing || onCooldown}
                                title={onCooldown ? `Cooldown: ${cooldownLabel} remaining` : 'Sync now'}
                                className={`rounded-xl px-6 py-2 flex items-center gap-2 transition-all shadow-lg ${onCooldown
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-none cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                    }`}
                            >
                                {isSyncing
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : onCooldown
                                        ? <Clock className="h-4 w-4" />
                                        : <RefreshCw className="h-4 w-4" />
                                }
                                {isSyncing
                                    ? 'Syncing…'
                                    : onCooldown
                                        ? `Wait ${cooldownLabel}`
                                        : 'Sync Now'
                                }
                            </Button>
                        )}
                    </div>

                    {/* Last sync info row */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                        {profile.lastSyncTime ? (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                <span>Last synced: <span className="font-medium text-gray-600 dark:text-gray-300">{formatRelativeTime(profile.lastSyncTime)}</span></span>
                            </>
                        ) : (
                            <>
                                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="italic">Never synced — click <strong>Sync Now</strong> to import your solved questions.</span>
                            </>
                        )}
                        {onCooldown && (
                            <span className="ml-auto text-yellow-500 font-medium">
                                Cooldown: {cooldownLabel} remaining
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Difficulty Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-purple-600" />
                        Difficulty Breakdown
                    </h3>
                    <div className="space-y-4">
                        {['Easy', 'Medium', 'Hard'].map((diff) => {
                            const count = profile.difficultyStats[diff] || 0;
                            const percentage = profile.totalSolved > 0 ? (count / profile.totalSolved) * 100 : 0;
                            const colorClass = diff === 'Easy' ? 'bg-green-500' : diff === 'Medium' ? 'bg-yellow-500' : 'bg-red-500';

                            return (
                                <div key={diff} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">{diff}</span>
                                        <span className="font-mono text-gray-500 dark:text-gray-400">{count} solved</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Topics */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <Code2 className="h-5 w-5 text-blue-600" />
                        Top Topics
                    </h3>
                    {Object.keys(profile.topicStats).length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No topic data yet — try syncing!</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(profile.topicStats)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 10)
                                .map(([topic, count]) => (
                                    <div
                                        key={topic}
                                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100 dark:border-blue-800/50 flex items-center gap-2"
                                    >
                                        {topic}
                                        <span className="bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded text-[10px]">{count}</span>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
