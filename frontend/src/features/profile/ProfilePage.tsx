import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/axios';
import { type User } from '@/types';
import { UserCircle, Mail, BookOpen, GraduationCap, Save, Loader2, Key, Trophy, Calendar, CheckCircle2, ChevronRight, BarChart3, ArrowLeft, LogOut, AlertCircle, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { type UserActivity } from '@/types';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LeetCodeProfile from '../leetcode/components/LeetCodeProfile';

export default function ProfilePage() {
    const { user: currentUser, logout } = useAuth();
    const { userId } = useParams();
    const navigate = useNavigate();

    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUserDataLoading, setIsUserDataLoading] = useState(!!userId);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        fatherName: '',
        email: '',
        username: '',
        course: '',
        branch: '',
        rollNumber: '',
        phoneNumber: '',
        section: '',
        session: '',
        password: '',
        leetCodeUsername: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activity, setActivity] = useState<UserActivity | null>(null);
    const [isActivityLoading, setIsActivityLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'leetcode'>('profile');

    const isViewOnly = !!userId && userId !== currentUser?.id;

    const handleLogoutClick = () => {
        setShowLogoutDialog(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutDialog(false);
        logout();
        navigate('/login');
    };

    const handleCancelLogout = () => {
        setShowLogoutDialog(false);
    };

    // Fetch user data if viewing another user
    useEffect(() => {
        const fetchTargetUser = async () => {
            if (!userId) {
                setTargetUser(currentUser);
                setIsUserDataLoading(false);
                return;
            }
            if (userId === currentUser?.id) {
                setTargetUser(currentUser);
                setIsUserDataLoading(false);
                return;
            }

            try {
                const response = await api.get(`/user/${userId}`);
                setTargetUser(response.data);
            } catch (error) {
                toast.error("User not found");
                navigate('/admin/users');
            } finally {
                setIsUserDataLoading(false);
            }
        };
        fetchTargetUser();
    }, [userId, currentUser, navigate]);

    useEffect(() => {
        if (targetUser) {
            setFormData({
                firstName: targetUser.firstName || '',
                lastName: targetUser.lastName || '',
                fatherName: targetUser.fatherName || '',
                email: targetUser.email || '',
                username: targetUser.username || '',
                course: targetUser.course || '',
                branch: targetUser.branch || '',
                rollNumber: targetUser.rollNumber || '',
                phoneNumber: targetUser.phoneNumber || '',
                section: targetUser.section || '',
                session: targetUser.session || '',
                password: '',
                leetCodeUsername: targetUser.leetCodeUsername || '',
            });
        }
    }, [targetUser]);

    useEffect(() => {
        const fetchActivity = async () => {
            setIsActivityLoading(true);
            try {
                const url = userId ? `/user/activity/${userId}` : '/user/activity';
                const response = await api.get(url);
                setActivity(response.data);
            } catch (error) {
                console.error("Failed to fetch activity");
            } finally {
                setIsActivityLoading(false);
            }
        };
        fetchActivity();
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isViewOnly) return;
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !targetUser) return;

        setIsLoading(true);
        setErrors({});
        try {
            await api.put(`/user/${targetUser.id}`, formData);

            // Only update local storage if updating own profile
            if (!userId || userId === currentUser.id) {
                const response = await api.get('/user/me');
                localStorage.setItem('auth_user', JSON.stringify(response.data));

                if (formData.password) {
                    const creds = { username: formData.username, password: formData.password };
                    localStorage.setItem('auth_credentials', JSON.stringify(creds));
                } else if (formData.username !== currentUser.username) {
                    const storedCreds = localStorage.getItem('auth_credentials');
                    if (storedCreds) {
                        const creds = JSON.parse(storedCreds);
                        creds.username = formData.username;
                        localStorage.setItem('auth_credentials', JSON.stringify(creds));
                    }
                }
            }

            toast.success('Profile updated successfully');
            if (!userId || userId === currentUser.id) {
                window.location.reload();
            } else {
                // If admin updating user, maybe just refresh data
                navigate('/admin/users');
            }
        } catch (error: any) {
            if (error.response?.data && typeof error.response.data === 'object' && !error.response.data.status) {
                setErrors(error.response.data);
                toast.error('Please correct the highlighted errors');
            } else {
                console.error(error);
                toast.error(error.response?.data?.message || 'Failed to update profile');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isUserDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading profile...</p>
            </div>
        );
    }

    if (!targetUser) return null;

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            {/* Admin Back Button */}
            {isViewOnly && (
                <Button
                    variant="ghost"
                    onClick={() => navigate(targetUser.role === 'FACULTY' ? '/admin/faculty' : '/admin/users')}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-2 font-bold"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Manage {targetUser.role === 'FACULTY' ? 'Personnel' : 'Users'}
                </Button>
            )}

            {/* Header section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-3xl p-8 text-white shadow-xl dark:shadow-2xl dark:shadow-blue-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <UserCircle className="h-40 w-40" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/30">
                        {targetUser.firstName?.[0]}{targetUser.lastName?.[0]}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {targetUser.firstName} {targetUser.lastName}
                        </h1>
                        <p className="text-white/80 mt-1 flex items-center justify-center md:justify-start gap-2">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                                {targetUser.role}
                            </span>
                            • {targetUser.username}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mt-8 justify-between items-center">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/70 hover:text-white'}`}
                        >
                            {isViewOnly ? 'View Profile' : 'Edit Profile'}
                        </button>
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'activity' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/70 hover:text-white'}`}
                        >
                            {isViewOnly ? "User Activity" : "Success & History"}
                        </button>
                        <button
                            onClick={() => setActiveTab('leetcode')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'leetcode' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/70 hover:text-white'}`}
                        >
                            LC Statistics
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'profile' ? (
                <div className="space-y-6">
                    {/* Personal Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-700 p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 dark:border-gray-700 pb-4">
                            <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Personal Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">First Name</label>
                                <Input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className="w-full bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/40 focus:border-blue-500 dark:focus:border-blue-600 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">Last Name</label>
                                <Input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className="w-full bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/40 focus:border-blue-500 dark:focus:border-blue-600 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">Father's Name</label>
                                <Input
                                    type="text"
                                    name="fatherName"
                                    value={formData.fatherName}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className="w-full bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/40 focus:border-blue-500 dark:focus:border-blue-600 transition-all"
                                />
                                {errors.fatherName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.fatherName}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1 flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5" /> Email Address
                                </label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className="w-full bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/40 focus:border-blue-500 dark:focus:border-blue-600 transition-all"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Academic Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-700 p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 dark:border-gray-700 pb-4">
                            <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Academic Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1 flex items-center gap-1.5">
                                    <BookOpen className="h-3.5 w-3.5" /> Course
                                </label>
                                <Input
                                    type="text"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className="w-full bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-600/40 focus:border-purple-500 dark:focus:border-purple-600 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">Branch</label>
                                <Input
                                    type="text"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className="w-full bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-600/40 focus:border-purple-500 dark:focus:border-purple-600 transition-all"
                                />
                                {errors.rollNumber && <p className="text-red-500 text-xs mt-1 ml-1">{errors.rollNumber}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">Roll Number</label>
                                <Input
                                    type="text"
                                    name="rollNumber"
                                    value={formData.rollNumber}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className="w-full bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-600/40 focus:border-purple-500 dark:focus:border-purple-600 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">Section</label>
                                <Input
                                    type="text"
                                    name="section"
                                    value={formData.section}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className="w-full bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-600/40 focus:border-purple-500 dark:focus:border-purple-600 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">Session</label>
                                <Input
                                    type="text"
                                    name="session"
                                    value={formData.session}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className="w-full bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-600/40 focus:border-purple-500 dark:focus:border-purple-600 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1 flex items-center gap-1.5">
                                    Phone Number
                                </label>
                                <Input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className="w-full bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-600/40 focus:border-purple-500 dark:focus:border-purple-600 transition-all"
                                />
                                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phoneNumber}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Account & Security */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-700 p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 dark:border-gray-700 pb-4">
                            <Key className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Account & Security</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">Username</label>
                                <Input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className="w-full bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-600/40 focus:border-red-500 dark:focus:border-red-600 transition-all"
                                />
                                {errors.username && <p className="text-red-500 text-xs mt-1 ml-1">{errors.username}</p>}
                            </div>
                            {!isViewOnly && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1">New Password (leave blank to keep current)</label>
                                    <Input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-600/40 focus:border-red-500 dark:focus:border-red-600 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1 flex items-center gap-1.5">
                                    <Code2 className="h-3.5 w-3.5" /> LeetCode Username
                                </label>
                                <Input
                                    type="text"
                                    name="leetCodeUsername"
                                    value={formData.leetCodeUsername}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    className="w-full bg-gray-50 dark:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/40 focus:border-blue-500 dark:focus:border-blue-600 transition-all"
                                    placeholder="Username"
                                />
                                {errors.leetCodeUsername && <p className="text-red-500 text-xs mt-1 ml-1">{errors.leetCodeUsername}</p>}
                            </div>
                        </div>

                        {/* Logout Button */}
                        {!isViewOnly && (
                            <div className="flex justify-center pt-6 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={handleLogoutClick}
                                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Submit Area - Hide if View Only */}
                    {!isViewOnly && (
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => window.location.reload()}
                                className="px-8 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all h-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-auto"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Save className="h-5 w-5" />
                                )}
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>
            ) : activeTab === 'leetcode' ? (
                <LeetCodeProfile userId={targetUser.id} isViewOnly={isViewOnly} />
            ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Quizzes Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-700 p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-700 pb-4">
                            <div className="flex items-center gap-3">
                                <Trophy className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">My Quizzes</h2>
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{activity?.mcqActivities.length || 0} Events</span>
                        </div>

                        {isActivityLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600 dark:text-blue-400" /></div>
                        ) : activity?.mcqActivities.length === 0 ? (
                            <div className="text-center p-12 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                                <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-500 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No quiz participation yet.</p>
                                <Link to="/events" className="text-blue-600 font-bold mt-2 inline-block">Explore Events</Link>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {activity?.mcqActivities.map(act => (
                                    <div key={act.eventId} className="group p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${act.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                                {act.status === 'COMPLETED' ? <CheckCircle2 className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100">{act.title}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                                                    Registered: {new Date(act.registeredAt).toLocaleDateString()}
                                                    {act.rank && <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter text-[10px]">Rank #{act.rank}</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            {act.score !== undefined && (
                                                <div>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Score</p>
                                                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">{act.score}<span className="text-xs text-gray-400 dark:text-gray-500 font-normal"> / {act.totalMarks}</span></p>
                                                </div>
                                            )}
                                            <Link to={`/test/${act.eventId}/result`} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all group-hover:shadow-sm">
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Contests Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-700 p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-700 pb-4">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">My Contests</h2>
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{activity?.contestActivities.length || 0} Contests</span>
                        </div>

                        {isActivityLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600 dark:text-blue-400" /></div>
                        ) : activity?.contestActivities.length === 0 ? (
                            <div className="text-center p-12 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                                <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-500 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No contest participation yet.</p>
                                <Link to="/contests" className="text-indigo-600 font-bold mt-2 inline-block">Join Contests</Link>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {activity?.contestActivities.map(act => (
                                    <div key={act.contestId} className="group p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <Trophy className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100">{act.title}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Solved {act.problemsSolved} / {act.totalProblems} Problems
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            <div>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Score</p>
                                                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{act.totalScore}</p>
                                            </div>
                                            <Link to={`/contests/${act.contestId}`} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-all group-hover:shadow-sm">
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Logout Confirmation Dialog */}
            {showLogoutDialog && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 transition-colors">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm mx-4 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Confirm Logout</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to logout? You'll need to log in again to access your account.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancelLogout}
                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
