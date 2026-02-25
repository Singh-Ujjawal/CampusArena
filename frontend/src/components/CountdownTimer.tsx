import { useState, useEffect } from 'react';
import { Timer, Clock } from 'lucide-react';

interface CountdownTimerProps {
    targetDate?: string;
    initialSeconds?: number;
    onEnd?: () => void;
    label?: string;
    className?: string;
    showIcon?: boolean;
}

export function CountdownTimer({ targetDate, initialSeconds, onEnd, label, className, showIcon = true }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const calculateTimeLeft = () => {
        if (initialSeconds !== undefined) return initialSeconds;
        if (!targetDate) return 0;
        const target = new Date(targetDate).getTime();
        const now = new Date().getTime();
        const difference = target - now;
        return Math.max(0, Math.floor(difference / 1000));
    };

    useEffect(() => {
        if (initialSeconds !== undefined) {
            setTimeLeft(initialSeconds);
        } else {
            setTimeLeft(calculateTimeLeft());
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (onEnd) onEnd();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, initialSeconds]);

    const formatTime = (seconds: number) => {
        const days = Math.floor(seconds / (24 * 3600));
        const hours = Math.floor((seconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        }

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const isUrgent = timeLeft < 300 && timeLeft > 0; // Less than 5 minutes

    return (
        <div className={`flex items-center gap-2 font-mono font-bold transition-colors ${isUrgent ? "text-red-600 dark:text-red-400 animate-pulse" : "text-gray-700 dark:text-gray-300"
            } ${className || ""}`}>
            {showIcon && (timeLeft < 3600 ? <Timer className="h-5 w-5" /> : <Clock className="h-5 w-5" />)}
            <div className="flex flex-col items-start leading-none">
                {label && <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">{label}</span>}
                <span className="text-lg">{formatTime(timeLeft)}</span>
            </div>
        </div>
    );
}
