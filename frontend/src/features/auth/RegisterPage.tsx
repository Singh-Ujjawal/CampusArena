import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Zap, Award, Users, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    passwordConfirm: z.string().min(6, 'Confirm password must be at least 6 characters'),
    email: z.string().email('Invalid email address'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    fatherName: z.string().min(1, 'Father name is required'),
    course: z.enum(['BTECH', 'BCA', 'BBA', 'BCOM', 'MBA', 'DIPLOMA']),
    branch: z.enum(['CSE', 'IT', 'AIML', 'DS', 'CIVIL', 'MECHANICAL', 'BIOTECH']).optional(),
    rollNumber: z.string().length(13, 'Roll number must be exactly 13 characters'),
    phoneNumber: z.string().length(10, 'Phone number must be exactly 10 characters'),
    section: z.string().length(1, 'Section must be a single character'),
    session: z.string().regex(/^20\d{2}-\d{2}$/, 'Session must be in YYYY-YY format (e.g., 2025-26)'),
    leetCodeUsername: z.string().optional(),
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string>('');

    const { register, handleSubmit, setError, watch, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const course = watch('course');

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        try {
            // Remove passwordConfirm before sending to backend
            const { passwordConfirm, ...submitData } = data;
            await api.post('/user', submitData);
            toast.success('Account created successfully! Please login.');
            navigate('/login');
        } catch (error: any) {
            if (error.response?.data && typeof error.response.data === 'object' && !error.response.data.status) {
                // Map backend field errors to form errors
                Object.keys(error.response.data).forEach((key: any) => {
                    setError(key, {
                        type: 'manual',
                        message: error.response.data[key],
                    });
                });
                toast.error('Please correct the highlighted errors');
            } else {
                toast.error(error.response?.data?.message || 'Registration failed');
            }
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

            {/* Right Side - Register Form */}
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 sm:px-12 overflow-y-auto" style={{ backgroundColor: '#1a1a1a' }}>
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: '#E8F4F8' }}>Create Account</h2>
                        <p style={{ color: '#B0BEC5' }}>Join CampusArena and start competing today</p>
                    </div>

                    <Card className="border-0 shadow-lg" style={{ backgroundColor: '#262626' }}>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="firstName" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">First Name</label>
                                        <Input
                                            id="firstName"
                                            placeholder="John"
                                            style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                            {...register('firstName')}
                                            error={errors.firstName?.message}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">Last Name</label>
                                        <Input
                                            id="lastName"
                                            placeholder="Doe"
                                            style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                            {...register('lastName')}
                                            error={errors.lastName?.message}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="fatherName" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">Father's Name</label>
                                    <Input
                                        id="fatherName"
                                        placeholder="Father's Name"
                                        style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                        {...register('fatherName')}
                                        error={errors.fatherName?.message}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Select
                                        label="Course"
                                        id="course"
                                        className="dark:bg-gray-900 dark:text-gray-100"
                                        style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                        options={[
                                            { value: 'BTECH', label: 'B.Tech' },
                                            { value: 'BCA', label: 'BCA' },
                                            { value: 'BBA', label: 'BBA' },
                                            { value: 'BCOM', label: 'B.Com' },
                                            { value: 'MBA', label: 'MBA' },
                                            { value: 'DIPLOMA', label: 'Diploma' },
                                        ]}
                                        {...register('course', {
                                            onChange: (e) => setSelectedCourse(e.target.value),
                                        })}
                                        error={errors.course?.message}
                                    />
                                    {(course === 'BTECH' || course === 'DIPLOMA') && (
                                        <Select
                                            label="Branch"
                                            id="branch"
                                            className="dark:bg-gray-900 dark:text-gray-100"
                                            style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                            options={[
                                                { value: 'CSE', label: 'CSE' },
                                                { value: 'IT', label: 'IT' },
                                                { value: 'AIML', label: 'AIML' },
                                                { value: 'DS', label: 'DS' },
                                                { value: 'CIVIL', label: 'Civil' },
                                                { value: 'MECHANICAL', label: 'Mechanical' },
                                                { value: 'BIOTECH', label: 'Biotech' },
                                            ]}
                                            {...register('branch')}
                                            error={errors.branch?.message}
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="rollNumber" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">Roll Number (13 digits)</label>
                                        <Input
                                            id="rollNumber"
                                            placeholder="2101640100000"
                                            maxLength={13}
                                            style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                            {...register('rollNumber')}
                                            error={errors.rollNumber?.message}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phoneNumber" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">Phone Number (10 digits)</label>
                                        <Input
                                            id="phoneNumber"
                                            placeholder="9876543210"
                                            maxLength={10}
                                            style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                            {...register('phoneNumber')}
                                            error={errors.phoneNumber?.message}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="section" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">Section</label>
                                        <Input
                                            id="section"
                                            placeholder="A, B, etc."
                                            maxLength={1}
                                            style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                            {...register('section')}
                                            error={errors.section?.message}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="session" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">Session (YYYY-YY)</label>
                                        <Input
                                            id="session"
                                            placeholder="2025-26"
                                            style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                            {...register('session')}
                                            error={errors.session?.message}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="leetCodeUsername" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">LeetCode Username</label>
                                    <Input
                                        id="leetCodeUsername"
                                        placeholder="johndoe_lc"
                                        style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                        {...register('leetCodeUsername')}
                                        error={errors.leetCodeUsername?.message}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">Email</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                        {...register('email')}
                                        error={errors.email?.message}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="username" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">Username</label>
                                    <Input
                                        id="username"
                                        placeholder="johndoe"
                                        style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040' }}
                                        {...register('username')}
                                        error={errors.username?.message}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">Password</label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min 6 characters"
                                            style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040', paddingRight: '40px' }}
                                            {...register('password')}
                                            error={errors.password?.message}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                        >
                                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="passwordConfirm" style={{ color: '#E8F4F8' }} className="text-sm font-medium block mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Input
                                            id="passwordConfirm"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Re-enter your password"
                                            style={{ backgroundColor: '#343434', color: '#E8F4F8', borderColor: '#404040', paddingRight: '40px' }}
                                            {...register('passwordConfirm')}
                                            error={errors.passwordConfirm?.message}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                        >
                                            {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full mt-4" style={{ backgroundColor: '#8ECAE6', color: '#000' }} isLoading={isLoading}>
                                    Create Account
                                </Button>
                            </form>

                            <div className="mt-6 pt-6" style={{ borderTop: '1px solid #404040' }}>
                                <p className="text-center text-sm" style={{ color: '#B0BEC5' }}>
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-semibold hover:opacity-80" style={{ color: '#8ECAE6' }}>
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs mt-6" style={{ color: '#707070' }}>
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
