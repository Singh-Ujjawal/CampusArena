import React from 'react';
import { cn } from './button';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
    error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, options, error, id, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900">
                        {label}
                    </label>
                )}
                <select
                    id={id}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-red-500 focus-visible:ring-red-500",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    <option value="" disabled className="bg-white text-gray-900">Select an option</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-white text-gray-900">{opt.label}</option>
                    ))}
                </select>
                {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
            </div>
        );
    }
);
Select.displayName = "Select";
