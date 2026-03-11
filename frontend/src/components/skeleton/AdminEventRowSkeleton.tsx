import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function AdminEventRowSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#f3f4f6';
    const highlightColor = isDark ? '#4b5563' : '#ffffff';

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl">
            {/* 
              Mirrors the padding and flex settings of the real CardContent / inner div
            */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 px-4 sm:py-3">
                
                {/* ── Left: title + meta skeleton ── */}
                <div className="flex-1 min-w-0">
                    
                    {/* Row 1: Title + Inline Faculty/Students */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:flex-wrap sm:gap-x-2 gap-1.5">
                        <Skeleton
                            width={160}
                            height={22}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                        <div className="hidden sm:flex gap-2">
                            <Skeleton width={100} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                            <Skeleton width={90} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                        </div>
                    </div>

                    {/* Row 2: Time + badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Skeleton width={130} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width={65} height={20} borderRadius={100} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width={80} height={20} borderRadius={100} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>

                    {/* Phone-only coords row */}
                    <div className="sm:hidden mt-2">
                        <Skeleton width={180} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                </div>

                {/* ── Right: action buttons skeleton ── */}
                <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:shrink-0 mt-2 sm:mt-0">
                    {/* 5 buttons typically exist: Edit, Questions, Analytics, Form, Delete */}
                    {[80, 85, 80, 95, 40].map((w, i) => (
                        <Skeleton
                            key={i}
                            width={w}
                            height={32}
                            borderRadius={6}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
