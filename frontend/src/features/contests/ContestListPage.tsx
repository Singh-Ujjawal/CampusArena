import { Trophy, Users } from 'lucide-react';
import { type Contest } from '@/types';
import { ContestListPageSkeleton } from '@/components/skeleton';
import { ArenaListPage } from '@/components/ArenaListPage';

export default function ContestListPage() {
    return (
        <ArenaListPage<Contest>
            title="Coding Contests"
            subtitle="Competitive Arena"
            description="Challenge yourself with curated competitions and climb the leaderboard."
            apiUrl="/api/contests"
            linkPrefix="/contests"
            searchPlaceholder="Find a contest..."
            itemTypeLabel={(_, activeFilter) => activeFilter === 'COMPLETED' ? 'Ranked' : 'Preparation'}
            itemStats={(contest) => ({
                stat1: { label: 'Problems', value: contest.problemIds?.length || 0, icon: Trophy },
                stat2: { label: 'Users', value: Math.floor(Math.random() * 50) + 12, icon: Users }
            })}
            Skeleton={ContestListPageSkeleton}
        />
    );
}
