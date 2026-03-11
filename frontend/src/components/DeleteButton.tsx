import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteButtonProps {
    onClick: (e: React.MouseEvent) => void;
    title?: string;
    label?: string;
    className?: string;
    variant?: 'icon' | 'full';
}

export function DeleteButton({ onClick, title = "Delete", label, className, variant = 'icon' }: DeleteButtonProps) {
    if (variant === 'full') {
        const fullClasses = `h-12 w-full sm:w-auto px-6 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 hover:bg-red-600 hover:text-white transition-all font-black flex items-center justify-center gap-2 ${className || ''}`;
        return (
            <Button
                onClick={onClick}
                className={fullClasses}
                title={title}
            >
                <Trash2 className="h-4 w-4" />
                {label || 'Delete'}
            </Button>
        );
    }

    const iconClasses = `h-9 w-9 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 p-0 shadow-sm transition-all ${className || ''}`;
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={iconClasses}
            title={title}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}
