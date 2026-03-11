import { Clock, CheckCircle } from 'lucide-react';
import { type Event } from '@/types';
import { EventListPageSkeleton } from '@/components/skeleton';
import { ArenaListPage } from '@/components/ArenaListPage';

export default function EventListPage() {
    return (
        <ArenaListPage<Event>
            title="Quiz Arena"
            subtitle="Skill Studio"
            description="Test your knowledge with curated quizzes and track your progress."
            apiUrl="/api/events"
            linkPrefix="/events"
            searchPlaceholder="Find a quiz..."
            itemTypeLabel={(event) => event.type || 'MCQ'}
            itemStats={(event) => ({
                stat1: { label: 'Duration', value: `${event.durationInMinutes}m`, icon: Clock },
                stat2: { label: 'Marks', value: event.totalMarks, icon: CheckCircle }
            })}
            Skeleton={EventListPageSkeleton}
        />
    );
}
