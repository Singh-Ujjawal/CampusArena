import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';
import { AdminQuestionCardSkeleton } from './AdminQuestionCardSkeleton';

export function AdminQuestionsPageSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#4b5563' : '#e5e7eb';

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton
                        width={40}
                        height={40}
                        borderRadius={6}
                        baseColor={baseColor}
                    />
                    <Skeleton
                        width={300}
                        height={32}
                        borderRadius={6}
                        baseColor={baseColor}
                    />
                </div>
                <Skeleton
                    width={140}
                    height={40}
                    borderRadius={6}
                    baseColor={baseColor}
                />
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <AdminQuestionCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
