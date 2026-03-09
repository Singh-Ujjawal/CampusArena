import { type ReactNode } from 'react';
import { BookOpen } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
    return (
        <div className="flex-1 w-full px-6 sm:px-10 flex flex-col justify-center py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
                        <BookOpen className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">{title}</h2>
                    {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
                </div>
                {children}
            </div>
        </div>
    );
}
