import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function AdminFacultyRowSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#1f2937' : '#f3f4f6';
    const highlightColor = isDark ? '#374151' : '#e5e7eb';

    return (
        <tr className="border-b border-gray-100 dark:border-gray-800">
            <td className="px-6 py-3">
                <div className="flex items-center gap-3">
                    <Skeleton circle width={40} height={40} baseColor={baseColor} highlightColor={highlightColor} />
                    <div className="space-y-1">
                        <Skeleton width={120} height={16} baseColor={baseColor} highlightColor={highlightColor} />
                        <Skeleton width={80} height={10} baseColor={baseColor} highlightColor={highlightColor} />
                    </div>
                </div>
            </td>
            <td className="px-6 py-3">
                <Skeleton width={150} height={12} baseColor={baseColor} highlightColor={highlightColor} />
            </td>
            <td className="px-6 py-3">
                <Skeleton width={100} height={12} baseColor={baseColor} highlightColor={highlightColor} />
            </td>
            <td className="px-6 py-3">
                <Skeleton width={70} height={18} borderRadius={6} baseColor={baseColor} highlightColor={highlightColor} />
            </td>
            <td className="px-6 py-3">
                <div className="flex justify-center">
                    <Skeleton width={32} height={32} borderRadius={8} baseColor={baseColor} highlightColor={highlightColor} />
                </div>
            </td>
        </tr>
    );
}
