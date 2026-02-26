import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '@/lib/axios';
import { type User } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: { userId: string; password: string }) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isFaculty: boolean;
    isStaff: boolean; // Admin or Faculty
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from local storage on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const storedUser = localStorage.getItem('auth_user');
            const storedToken = localStorage.getItem('auth_token');

            if (storedUser && storedToken) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                    localStorage.removeItem('auth_user');
                    localStorage.removeItem('auth_token');
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

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

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        toast.info('Logged out');
    };

    const value = {
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
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
