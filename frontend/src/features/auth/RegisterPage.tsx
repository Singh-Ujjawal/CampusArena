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
import { InteractiveLoginAside } from './InteractiveLoginAside';

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    passwordConfirm: z.string().min(6, 'Confirm password must be at least 6 characters'),
    email: z.string().email('Invalid email address'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    fatherName: z.string().min(1, 'Father name is required'),
    course: z.enum(['BTECH', 'BCA', 'BBA', 'BCOM', 'MBA', 'DIPLOMA'], { message: 'Please select a course' }),
    branch: z.enum(['CSE', 'IT', 'AIML', 'DS', 'CIVIL', 'MECHANICAL', 'BIOTECH'], { message: 'Please select a branch' }),
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
        <div className="flex min-h-screen">
            {/* Left Side - sticky image panel with cursor effect */}
            <div className="hidden lg:block lg:w-1/2 sticky top-0 h-screen flex-shrink-0" style={{ borderRight: '3px solid #cbd5e1' }}>
                <InteractiveLoginAside />
            </div>

            {/* Right Side - Register Form (always light) */}
            <div className="light flex-1 flex flex-col items-center justify-center py-12 px-6 sm:px-12 min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: '#1e293b' }}>Create Account</h2>
                        <p style={{ color: '#64748b' }}>Join CampusArena and start competing today</p>
                    </div>

                    <Card className="border-0 shadow-lg" style={{ backgroundColor: '#ffffff' }}>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="firstName" style={{ color: '#000000' }} className="text-sm font-medium block mb-2">First Name</label>
                                        <Input
                                            id="firstName"
                                            placeholder="John"
                                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                            {...register('firstName')}
                                            error={errors.firstName?.message}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" style={{ color: '#000000' }} className="text-sm font-medium block mb-2">Last Name</label>
                                        <Input
                                            id="lastName"
                                            placeholder="Doe"
                                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                            {...register('lastName')}
                                            error={errors.lastName?.message}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="fatherName" style={{ color: '#000000' }} className="text-sm font-medium block mb-2">Father's Name</label>
                                    <Input
                                        id="fatherName"
                                        placeholder="Father's Name"
                                        style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                        {...register('fatherName')}
                                        error={errors.fatherName?.message}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Select
                                        label="Course"
                                        id="course"
                                        className=""
                                        style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                        options={[
                                            { value: '', label: 'Select Course' },
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
                                    <Select
                                        label="Branch"
                                        id="branch"
                                        className=""
                                        style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                        options={[
                                            { value: '', label: 'Select Branch' },
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
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="rollNumber" style={{ color: '#000000' }} className="text-sm font-medium block mb-2">Roll Number (13 digits)</label>
                                        <Input
                                            id="rollNumber"
                                            placeholder="2101640100000"
                                            maxLength={13}
                                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                            {...register('rollNumber')}
                                            error={errors.rollNumber?.message}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phoneNumber" style={{ color: '#000000' }} className="text-sm font-medium block mb-2">Phone Number (10 digits)</label>
                                        <Input
                                            id="phoneNumber"
                                            placeholder="9876543210"
                                            maxLength={10}
                                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                            {...register('phoneNumber')}
                                            error={errors.phoneNumber?.message}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="section" style={{ color: '#000000' }} className="text-sm font-medium block mb-2">Section</label>
                                        <Input
                                            id="section"
                                            placeholder="A, B, etc."
                                            maxLength={1}
                                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                            {...register('section')}
                                            error={errors.section?.message}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="session" style={{ color: '#000000' }} className="text-sm font-medium block mb-2">Session (YYYY-YY)</label>
                                        <Input
                                            id="session"
                                            placeholder="2023-27"
                                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                            {...register('session')}
                                            error={errors.session?.message}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="leetCodeUsername" style={{ color: '#000000' }} className="text-sm font-medium block mb-2">LeetCode Username</label>
                                    <Input
                                        id="leetCodeUsername"
                                        placeholder="johndoe_lc"
                                        style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                        {...register('leetCodeUsername')}
                                        error={errors.leetCodeUsername?.message}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" style={{ color: '#000000' }} className="text-sm font-medium block mb-2">Email</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                        {...register('email')}
                                        error={errors.email?.message}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="username" style={{ color: '#000000' }} className="text-sm font-medium block mb-2">Username</label>
                                    <Input
                                        id="username"
                                        placeholder="johndoe"
                                        style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1' }}
                                        {...register('username')}
                                        error={errors.username?.message}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" style={{ color: '#000000' }} className="text-sm font-medium block mb-2">Password</label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min 6 characters"
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

                                <div>
                                    <label htmlFor="passwordConfirm" style={{ color: '#000000' }} className="text-sm font-medium block mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Input
                                            id="passwordConfirm"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Re-enter your password"
                                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b', borderColor: '#cbd5e1', paddingRight: '40px' }}
                                            {...register('passwordConfirm')}
                                            error={errors.passwordConfirm?.message}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full mt-4" style={{ backgroundColor: '#6366f1', color: '#fff' }} isLoading={isLoading}>
                                    Create Account
                                </Button>
                            </form>

                            <div className="mt-6 pt-6" style={{ borderTop: '1px solid #e2e8f0' }}>
                                <p className="text-center text-sm" style={{ color: '#64748b' }}>
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-semibold hover:opacity-80" style={{ color: '#6366f1' }}>
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs mt-6" style={{ color: '#94a3b8' }}>
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
