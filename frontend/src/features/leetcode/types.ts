export interface LcUserProfile {
    name: string;
    leetCodeUsername: string;
    totalSolved: number;
    difficultyStats: Record<string, number>;
    topicStats: Record<string, number>;
    lastSyncTime: string | null;        // ISO datetime string from backend
    lastSyncedTimestamp: number | null; // epoch millis for cooldown countdown
}

export interface LcLeaderboardEntry {
    name: string;
    leetCodeUsername: string;
    totalSolved: number;
    userId: string;
    rollNumber?: string;
}
