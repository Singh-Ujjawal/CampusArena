import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/axios';
import { type User } from '@/types';
import { UserCircle, Mail, BookOpen, GraduationCap, Save, Loader2, Key, Trophy, Calendar, ChevronRight, BarChart3, ArrowLeft, LogOut, AlertCircle, Code2, FileQuestion, FileDown, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { type UserActivity } from '@/types';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LeetCodeProfile from '../leetcode/components/LeetCodeProfile';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProfilePage() {
    const { user: currentUser, logout } = useAuth();
    const { userId } = useParams();
    const navigate = useNavigate();

    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUserDataLoading, setIsUserDataLoading] = useState(!!userId);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'leetcode'>('profile');
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
    const [isActivityLoading, setIsActivityLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const isViewOnly = !!userId && userId !== currentUser?.id;

    const handleLogoutClick = () => {
        setShowLogoutDialog(true);
    };

    // ── PDF Generation Report ───────────────────────────────────────────────────
    const handleDownloadReport = async () => {
        if (!targetUser || !activity) return;
        setIsDownloading(true);

        try {
            const doc = new jsPDF();
            const timestamp = new Date().toLocaleString();

            // Header
            doc.setFillColor(37, 99, 235); // Blue-600
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('Student Success Report', 20, 26);
            doc.setFontSize(10);
            doc.text(`Generated on: ${timestamp}`, 140, 26);

            // User Info Section
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.text('Personal Information', 20, 55);
            doc.setDrawColor(200, 200, 200);
            doc.line(20, 58, 190, 58);

            doc.setFontSize(11);
            doc.text(`Name: ${targetUser.firstName} ${targetUser.lastName}`, 20, 68);
            doc.text(`Email: ${targetUser.email}`, 20, 75);
            doc.text(`Roll Number: ${targetUser.rollNumber || 'N/A'}`, 120, 68);
            doc.text(`Branch/Course: ${targetUser.branch || 'N/A'} - ${targetUser.course || 'N/A'}`, 120, 75);
            doc.text(`Session: ${targetUser.session || 'N/A'}`, 120, 82);

            let currentY = 90;

            // 1. Quizzes History
            if (activity.mcqActivities.length > 0) {
                doc.setFontSize(14);
                doc.text('Quiz Participation & Performance', 20, currentY);
                doc.line(20, currentY + 3, 190, currentY + 3);
                
                autoTable(doc, {
                    startY: currentY + 8,
                    head: [['Quiz Title', 'Date', 'Score', 'Total', 'Rank', 'Status']],
                    body: activity.mcqActivities.map(q => [
                        q.title,
                        q.submittedAt ? new Date(q.submittedAt).toLocaleDateString() : 'N/A',
                        q.score?.toString() || '0',
                        q.totalMarks?.toString() || '0',
                        q.rank ? `#${q.rank}` : 'N/A',
                        q.status
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [37, 99, 235] }
                });
                currentY = (doc as any).lastAutoTable.finalY + 15;
            }

            // 2. Contest History
            if (activity.contestActivities.length > 0) {
                if (currentY > 240) { doc.addPage(); currentY = 20; }
                doc.setFontSize(14);
                doc.text('Coding Contests Performance', 20, currentY);
                doc.line(20, currentY + 3, 190, currentY + 3);

                autoTable(doc, {
                    startY: currentY + 8,
                    head: [['Contest Title', 'Solved', 'Total Problems', 'Total Score']],
                    body: activity.contestActivities.map(c => [
                        c.title,
                        c.problemsSolved.toString(),
                        c.totalProblems.toString(),
                        c.totalScore.toString()
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [79, 70, 229] } // Indigo-600
                });
                currentY = (doc as any).lastAutoTable.finalY + 15;
            }

            // 3. Registration History
            if (activity.registrationActivities.length > 0) {
                if (currentY > 240) { doc.addPage(); currentY = 20; }
                doc.setFontSize(14);
                doc.text('Event Registrations & Evaluations', 20, currentY);
                doc.line(20, currentY + 3, 190, currentY + 3);

                autoTable(doc, {
                    startY: currentY + 8,
                    head: [['Form Title', 'Registration Date', 'Status', 'Evaluation', 'Marks']],
                    body: activity.registrationActivities.map(r => [
                        r.title,
                        new Date(r.registeredAt).toLocaleDateString(),
                        r.status,
                        r.evaluationStatus,
                        r.score !== null ? `${r.score} / ${r.totalMarks}` : 'N/A'
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [234, 88, 12] } // Orange-600
                });
                currentY = (doc as any).lastAutoTable.finalY + 15;
            }

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Campus Arena - Student Portfolio System`, 20, 285);
            doc.text(`Page: 1/1`, 180, 285);

            doc.save(`Success_Report_${targetUser.rollNumber || targetUser.firstName}.pdf`);
            toast.success('Report downloaded successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate PDF');
        } finally {
            setIsDownloading(false);
        }
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
                    {/* Activity Portfolio Header */}
                    <div className="group relative bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 text-white overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-[80px] group-hover:bg-white/15 transition-all duration-700"></div>
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-400/20 rounded-full blur-[60px]"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
                                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Performance Tracking</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
                                    Activity <span className="text-blue-200">Portfolio</span>
                                </h2>
                                <p className="text-indigo-100/70 mt-3 text-lg font-medium max-w-xl">
                                    A comprehensive record of your academic achievements, contest standings, and technical evaluations.
                                </p>
                            </div>
                            
                            <Button
                                onClick={handleDownloadReport}
                                disabled={isDownloading || isActivityLoading}
                                className="group/btn relative h-auto py-5 px-8 rounded-2xl bg-white hover:bg-white text-indigo-700 font-black shadow-2xl shadow-blue-900/40 transition-all hover:scale-[1.05] active:scale-95 disabled:opacity-70"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover/btn:opacity-100 rounded-2xl transition-opacity"></div>
                                <div className="relative z-10 flex items-center gap-3">
                                    {isDownloading ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <FileDown className="h-6 w-6 group-hover/btn:rotate-12 transition-transform" />
                                    )}
                                    <div className="text-left leading-tight">
                                        <span className="block text-[10px] uppercase tracking-widest opacity-60">Generate PDF</span>
                                        <span className="text-lg">Performance Report</span>
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Quizzes Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/30">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                                        <Trophy className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight">Quiz History</h3>
                                </div>
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400">
                                    {activity?.mcqActivities.length || 0} Events
                                </span>
                            </div>

                            <div className="p-6 flex-1 max-h-[500px] overflow-y-auto scrollbar-hide">
                                {isActivityLoading ? (
                                    <div className="flex justify-center p-12"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
                                ) : activity?.mcqActivities.length === 0 ? (
                                    <div className="text-center py-16 opacity-50">
                                        <Calendar className="h-12 w-12 mx-auto mb-4" />
                                        <p className="font-bold">No quizzes participated yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activity?.mcqActivities.map(act => (
                                            <div key={act.eventId} className="group p-5 rounded-2xl border border-gray-50 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-all">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex flex-col">
                                                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{act.title}</h4>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                                            <Clock className="h-3 w-3" />
                                                            {act.submittedAt ? new Date(act.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">{act.score}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">/ {act.totalMarks} Points</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {act.rank && (
                                                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-md text-[10px] font-black uppercase">Rank #{act.rank}</span>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${act.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'}`}>
                                                        {act.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contests Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/30">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                        <Code2 className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight">Coding Contests</h3>
                                </div>
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400">
                                    {activity?.contestActivities.length || 0} Participation
                                </span>
                            </div>

                            <div className="p-6 flex-1 max-h-[500px] overflow-y-auto scrollbar-hide">
                                {isActivityLoading ? (
                                    <div className="flex justify-center p-12"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>
                                ) : activity?.contestActivities.length === 0 ? (
                                    <div className="text-center py-16 opacity-50">
                                        <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                                        <p className="font-bold">No contests participated yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activity?.contestActivities.map(act => (
                                            <div key={act.contestId} className="group p-5 rounded-2xl border border-gray-50 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-all">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{act.title}</h4>
                                                    <div className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-lg font-black shadow-lg shadow-indigo-200 dark:shadow-none">
                                                        {act.totalScore}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Solved</span>
                                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{act.problemsSolved} <span className="text-gray-400 font-medium">/ {act.totalProblems}</span></span>
                                                        </div>
                                                        <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700"></div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Efficiency</span>
                                                            <span className="text-sm font-bold text-green-600">
                                                                {act.totalProblems > 0 ? Math.round((act.problemsSolved / act.totalProblems) * 100) : 0}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Link to={`/contests/${act.contestId}`} className="h-10 w-10 rounded-full border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all">
                                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Registration History Section - Full Width */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-10 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-orange-50/50 to-white dark:from-orange-950/20 dark:to-gray-900/30">
                            <div className="flex items-center gap-5">
                                <div className="h-16 w-16 rounded-[1.5rem] bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-inner">
                                    <FileQuestion className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight">Registration & Evaluations</h3>
                                    <p className="text-gray-500 font-medium text-sm mt-0.5">Formal event participation and faculty grading history</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden md:block">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Activities</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-gray-50 leading-none">{activity?.registrationActivities.length || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-10">
                            {isActivityLoading ? (
                                <div className="flex justify-center p-20"><Loader2 className="h-12 w-12 animate-spin text-orange-600" /></div>
                            ) : activity?.registrationActivities.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <GraduationCap className="h-20 w-20 text-gray-200 dark:text-gray-700 mx-auto mb-6" />
                                    <h4 className="text-xl font-bold text-gray-400">No formal registrations on record</h4>
                                    <p className="text-gray-400 mt-2">Participate in events to see your evaluation history here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activity?.registrationActivities.map(act => (
                                        <div key={act.formId} className="group flex flex-col p-6 rounded-3xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                                            {/* Status Badge */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${act.status === 'APPROVED' ? 'bg-green-100 text-green-600' : act.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                        <Calendar className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 mx-auto uppercase tracking-widest">Registered At</p>
                                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{new Date(act.registeredAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    act.status === 'APPROVED' ? 'bg-green-500 text-white' :
                                                    act.status === 'REJECTED' ? 'bg-red-500 text-white' :
                                                    'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                }`}>
                                                    {act.status}
                                                </span>
                                            </div>

                                            <h4 className="text-xl font-black text-gray-900 dark:text-white mb-6 pr-10 line-clamp-1">{act.title}</h4>

                                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-700">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Evaluation Status</span>
                                                    <span className={`text-xs font-bold mt-1 ${act.evaluationStatus === 'GRADED' ? 'text-green-600' : 'text-amber-500'}`}>
                                                        {act.evaluationStatus}
                                                    </span>
                                                </div>
                                                
                                                {act.evaluationStatus === 'GRADED' ? (
                                                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                        <div className="text-right">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Final Score</span>
                                                            <div className="text-xl font-black text-gray-900 dark:text-white">
                                                                {act.score} <span className="text-xs text-gray-400 font-bold">/ {act.totalMarks}</span>
                                                            </div>
                                                        </div>
                                                        <Trophy className="h-6 w-6 text-yellow-500" />
                                                    </div>
                                                ) : act.status === 'APPROVED' ? (
                                                    <div className="flex items-center gap-2 text-amber-500 animate-pulse">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span className="text-xs font-black uppercase tracking-tighter">Awaiting Grade</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs font-black text-gray-300 uppercase italic">Not Evaluated</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Dialog */}
            {showLogoutDialog && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 transition-colors">
                    <div className="bg-white dark:bg-gray-800 rounded-[1.5rem] shadow-2xl p-8 max-w-sm mx-4 transition-all scale-in-center">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                                <AlertCircle className="h-7 w-7" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-50 tracking-tight">Logout?</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium leading-relaxed">
                            Are you sure you want to end your session? You'll need your credentials to log back in.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleCancelLogout}
                                className="flex-1 px-6 py-4 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50 font-black hover:bg-gray-200 dark:hover:bg-gray-600 transition-all uppercase text-xs tracking-widest"
                            >
                                Stay
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                className="flex-1 px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-600/20 transition-all uppercase text-xs tracking-widest"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
