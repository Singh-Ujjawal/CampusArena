import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Award, Users } from 'lucide-react';

const loginSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

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
        <div className="min-h-screen flex">
            {/* Left Side - Website Details & Logo */}
            <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between text-white" style={{ background: 'linear-gradient(to bottom right, #8ECAE6, #4B7BA7)' }}>
                <div>
                    <div className="mb-12 flex items-center gap-4 h-50">
                        <img src="/main_logo.png" alt="Logo" className="h-full object-contain" />
                        <img src="/name.png" alt="CampusArena" className="h-full object-contain" />
                    </div>
                    
                    <p className="text-lg mb-8" style={{ color: '#E8F4F8' }}>
                        Compete, Learn, and Excel in Programming Contests
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 rounded-lg p-3" style={{ backgroundColor: '#8ECAE6' }}>
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-1">Fast & Responsive</h3>
                            <p style={{ color: '#E8F4F8' }}>Experience lightning-fast contests with real-time updates and instant feedback.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 rounded-lg p-3" style={{ backgroundColor: '#8ECAE6' }}>
                            <Award className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-1">Competitive Edge</h3>
                            <p style={{ color: '#E8F4F8' }}>Climb the leaderboards and prove your programming prowess.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 rounded-lg p-3" style={{ backgroundColor: '#8ECAE6' }}>
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-1">Community Driven</h3>
                            <p style={{ color: '#E8F4F8' }}>Join thousands of programmers and collaborate with the best.</p>
                        </div>
                    </div>
                </div>

                <p className="text-sm" style={{ color: '#D0E8F2' }}>© 2026 CampusArena. All rights reserved.</p>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-8 lg:px-16" style={{ backgroundColor: '#1a1a1a' }}>
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F8' }}>Sign in</h2>
                        <p style={{ color: '#B0BEC5' }}>Welcome back to CampusArena</p>
                    </div>

                    <Card className="border-0 shadow-lg" style={{ backgroundColor: '#262626' }}>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label htmlFor="userId" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">User ID / Username</label>
                                    <Input
                                        id="userId"
                                        placeholder="Enter your ID or username"
                                        style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                        {...register('userId')}
                                        error={errors.userId?.message}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">Password</label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                        {...register('password')}
                                        error={errors.password?.message}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="h-4 w-4" style={{ accentColor: '#8ECAE6' }} />
                                        <span className="ml-2 text-sm" style={{ color: '#B0BEC5' }}>Remember me</span>
                                    </label>
                                    <Link to="/forgot-password" className="text-sm hover:opacity-80" style={{ color: '#8ECAE6' }}>
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button type="submit" className="w-full" style={{ backgroundColor: '#8ECAE6', color: '#000' }} isLoading={isLoading}>
                                    Sign In
                                </Button>
                            </form>

                            <div className="mt-6 pt-6" style={{ borderTop: '1px solid #404040' }}>
                                <p className="text-center text-sm" style={{ color: '#B0BEC5' }}>
                                    Don't have an account?{' '}
                                    <Link to="/register" className="font-semibold hover:opacity-80" style={{ color: '#8ECAE6' }}>
                                        Create one now
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs mt-6" style={{ color: '#707070' }}>
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
