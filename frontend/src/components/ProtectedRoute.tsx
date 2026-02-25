import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    requireAdmin?: boolean;
    requireFaculty?: boolean;
    requireStaff?: boolean; // Admin or Faculty
}

export default function ProtectedRoute({ requireAdmin, requireFaculty, requireStaff }: ProtectedRouteProps) {
    const { isLoading, isAuthenticated, isAdmin, isFaculty, isStaff } = useAuth();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    if (requireFaculty && !isFaculty) {
        return <Navigate to="/dashboard" replace />;
    }

    if (requireStaff && !isStaff) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
