import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { InteractiveLoginAside } from './InteractiveLoginAside';

const loginSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            await login(data);
            navigate('/dashboard');
        } catch (error) {
            // Error handled by AuthContext/Interceptor (toast)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left Side - sticky image panel */}
            <div className="hidden lg:block lg:w-1/2 sticky top-0 h-screen flex-shrink-0">
                <InteractiveLoginAside />
            </div>

            {/* Right Side - scrollable login form (always light) */}
            <div className="light flex-1 flex flex-col items-center justify-center py-12 px-6 sm:px-12 min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: '#1e293b' }}>Sign in</h2>
                        <p style={{ color: '#64748b' }}>Welcome back to CampusArena</p>
                    </div>

                    <Card className="border-0 shadow-lg" style={{ backgroundColor: '#ffffff' }}>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label htmlFor="userId" style={{ color: '#334155' }} className="text-sm font-medium block mb-2">User ID / Username</label>
                                    <Input
                                        id="userId"
                                        placeholder="Enter your ID or username"
                                        style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                        {...register('userId')}
                                        error={errors.userId?.message}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" style={{ color: '#334155' }} className="text-sm font-medium block mb-2">Password</label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1', paddingRight: '40px' }}
                                            {...register('password')}
                                            error={errors.password?.message}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="h-4 w-4" style={{ accentColor: '#6366f1' }} />
                                        <span className="ml-2 text-sm" style={{ color: '#64748b' }}>Remember me</span>
                                    </label>
                                    <Link to="/forgot-password" className="text-sm hover:opacity-80" style={{ color: '#6366f1' }}>
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button type="submit" className="w-full" style={{ backgroundColor: '#6366f1', color: '#fff' }} isLoading={isLoading}>
                                    Sign In
                                </Button>
                            </form>

                            <div className="mt-6 pt-6" style={{ borderTop: '1px solid #e2e8f0' }}>
                                <p className="text-center text-sm" style={{ color: '#64748b' }}>
                                    Don't have an account?{' '}
                                    <Link to="/register" className="font-semibold hover:opacity-80" style={{ color: '#6366f1' }}>
                                        Create one now
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs mt-6" style={{ color: '#94a3b8' }}>
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
