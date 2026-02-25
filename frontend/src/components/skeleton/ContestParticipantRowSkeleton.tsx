import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '@/context/ThemeContext';

export function ContestParticipantRowSkeleton() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const baseColor = isDark ? '#374151' : '#e5e7eb';
    const highlightColor = isDark ? '#4b5563' : '#f3f4f6';

    return (
        <tr className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors border-b border-gray-50 dark:border-gray-800">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                        <Skeleton
                            width="80%"
                            height={14}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                        <Skeleton
                            width="60%"
                            height={12}
                            baseColor={baseColor}
                            highlightColor={highlightColor}
                        />
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <Skeleton
                    width="70%"
                    height={14}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                />
                <Skeleton
                    width="50%"
                    height={12}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                    style={{ marginTop: '4px' }}
                />
            </td>
            <td className="px-6 py-4 text-center">
                <Skeleton
                    width={60}
                    height={28}
                    borderRadius={12}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                />
            </td>
            <td className="px-6 py-4 text-center">
                <Skeleton
                    width={70}
                    height={28}
                    borderRadius={12}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                />
            </td>
            <td className="px-6 py-4">
                <Skeleton
                    width="65%"
                    height={14}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                />
            </td>
            <td className="px-6 py-4 text-right">
                <Skeleton
                    width={100}
                    height={28}
                    borderRadius={6}
                    baseColor={baseColor}
                    highlightColor={highlightColor}
                />
            </td>
        </tr>
    );
}
