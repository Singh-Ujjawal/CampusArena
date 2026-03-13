import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { api } from '@/lib/axios';
import { type User } from '@/types';
import { toast } from 'sonner';
import { isTokenValid, msUntilExpiry } from '@/lib/token';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: { userId: string; password: string }) => Promise<void>;
    logout: (reason?: string) => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isFaculty: boolean;
    isStaff: boolean; // Admin or Faculty
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback((reason?: string) => {
        setUser(null);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        
        if (reason === 'session_expired') {
            toast.error('Session expired. Please log in again.');
            // Only redirect if we are not already on the login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (reason !== 'silent') {
            toast.info('Logged out');
        }
    }, []);

    // 1. Initial Load: Sync state with localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('auth_user');
        const storedToken = localStorage.getItem('auth_token');

        if (storedUser && storedToken) {
            if (isTokenValid(storedToken)) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                    logout('silent');
                }
            } else {
                logout('session_expired');
            }
        }
        setIsLoading(false);
    }, [logout]);

    // 2. Session Timer: Automatically logout when token expires
    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem('auth_token');
        const timeout = msUntilExpiry(token);

        if (timeout > 0) {
            const timer = setTimeout(() => {
                logout('session_expired');
            }, timeout);
            return () => clearTimeout(timer);
        } else if (token) {
            // Token already expired
            logout('session_expired');
        }
    }, [user, logout]);

    // 3. Global Event Listener: Handle logout requests from other layers (like Axios)
    useEffect(() => {
        const handleLogoutEvent = (event: any) => {
            const reason = event.detail?.reason;
            logout(reason);
        };

        window.addEventListener('auth:logout', handleLogoutEvent);
        return () => window.removeEventListener('auth:logout', handleLogoutEvent);
    }, [logout]);

    const login = async ({ userId, password }: { userId: string; password: string }) => {
        setIsLoading(true);
        try {
            // userId here is treated as 'username' in our backend
            const response = await api.post('/api/auth/login', { username: userId, password });
            
            const { token } = response.data;
            localStorage.setItem('auth_token', token);

            // Fetch full profile info now that we have the token
            const meRes = await api.get('/user/me');
            const userData = meRes.data;
            
            // Setting user triggers the Session Timer useEffect
            setUser(userData);
            localStorage.setItem('auth_user', JSON.stringify(userData));

            toast.success('Logged in successfully');
        } catch (error) {
            console.error(error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user && isTokenValid(localStorage.getItem('auth_token')),
        isAdmin: user?.role === 'ADMIN',
        isFaculty: user?.role === 'FACULTY',
        isStaff: user?.role === 'ADMIN' || user?.role === 'FACULTY',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

