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
            // Fetch clubs to determine their strict creation order
            const clubsRes = await api.get('/api/clubs').catch(() => ({ data: [] }));
            const allClubs = clubsRes.data || [];
            const clubOrderMap = new Map<string, number>();
            allClubs.forEach((c: any, index: number) => {
                clubOrderMap.set(c.name, index);
            });

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

            const eventsByClub: Record<string, {
                title: string;
                type: string;
                date: string;
                score: string;
                rank: string | number | null | undefined;
                status: string;
            }[]> = {};

            const addEvent = (clubName: string | undefined, eventDetail: any) => {
                const name = clubName && clubName !== 'General' ? clubName : 'General Campus Activities';
                if (!eventsByClub[name]) {
                    eventsByClub[name] = [];
                }
                eventsByClub[name].push(eventDetail);
            };

            activity.mcqActivities.forEach(q => addEvent(q.clubName, {
                title: q.title,
                type: 'Quiz/Assessment',
                date: q.submittedAt ? new Date(q.submittedAt).toLocaleDateString() : 'N/A',
                score: `${q.score || 0} / ${q.totalMarks || 0}`,
                rank: q.rank,
                status: q.status
            }));

            activity.contestActivities.forEach(c => addEvent(c.clubName, {
                title: c.title,
                type: 'Coding Contest',
                date: c.lastSubmissionTime ? new Date(c.lastSubmissionTime).toLocaleDateString() : 'N/A',
                score: `${c.totalScore} (Solved: ${c.problemsSolved}/${c.totalProblems})`,
                rank: c.rank,
                status: 'Participated'
            }));

            activity.registrationActivities.forEach(r => addEvent(r.clubName, {
                title: r.title,
                type: 'Event Evaluation',
                date: new Date(r.registeredAt).toLocaleDateString(),
                score: r.evaluationStatus === 'GRADED' ? `${r.score} / ${r.totalMarks}` : (r.evaluationStatus || 'PENDING'),
                rank: null,
                status: r.status
            }));

            const clubs = Object.keys(eventsByClub).sort((a, b) => {
                if (a === 'General Campus Activities') return 1;
                if (b === 'General Campus Activities') return -1;
                
                const orderA = clubOrderMap.has(a) ? clubOrderMap.get(a)! : 999;
                const orderB = clubOrderMap.has(b) ? clubOrderMap.get(b)! : 999;
                
                if (orderA !== orderB) return orderA - orderB;
                
                return a.localeCompare(b);
            });

            if (clubs.length > 0) {
                doc.setFontSize(16);
                doc.text('Club-wise Participation Summary', 20, currentY);
                currentY += 10;

                clubs.forEach((club) => {
                    const events = eventsByClub[club];
                    if (currentY > 250) { doc.addPage(); currentY = 20; }
                    
                    doc.setFontSize(13);
                    doc.setTextColor(37, 99, 235);
                    doc.text(`${club} (${events.length} Event${events.length !== 1 ? 's' : ''})`, 20, currentY);
                    doc.setTextColor(0, 0, 0);
                    
                    autoTable(doc, {
                        startY: currentY + 4,
                        head: [['Event Title', 'Event Type', 'Date', 'Score/Performance', 'Rank', 'Status']],
                        body: events.map(e => [
                            e.title,
                            e.type,
                            e.date,
                            e.score,
                            e.rank ? `#${e.rank}` : '-',
                            e.status
                        ]),
                        theme: 'striped',
                        headStyles: { fillColor: [79, 70, 229] },
                        margin: { left: 20, right: 20 }
                    });
                    
                    currentY = (doc as any).lastAutoTable.finalY + 15;
                });
            } else {
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text('No activity recorded yet.', 20, currentY);
                currentY += 10;
            }

            // Footer
            const totalPages = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Campus Arena - Student Portfolio System`, 20, 285);
                doc.text(`Page: ${i}/${totalPages}`, 180, 285);
            }

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
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
                    {/* Compact Activity Portfolio Header with Built-in Stats */}
                    <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 group shadow-sm transition-all">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl transition-all duration-700 ease-in-out group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40" />
                        
                        <div className="relative z-10 flex items-center gap-5 w-full lg:w-auto shrink-0 justify-center lg:justify-start">
                            <div className="h-14 w-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Performance <span className="text-indigo-600 dark:text-indigo-400">Overview</span></h2>
                                <p className="text-sm font-medium text-slate-500 mt-0.5">Your academic & technical evaluations</p>
                            </div>
                        </div>

                        {/* Integrated Stats Row */}
                        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 bg-slate-50 dark:bg-slate-800/40 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 w-full lg:w-auto flex-1 justify-center">
                            <div className="text-center sm:text-left shrink-0 pb-4 sm:pb-0 sm:border-r border-slate-200 dark:border-slate-700 sm:pr-8">
                                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center sm:justify-start gap-1.5">
                                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                    Total Success
                                </h3>
                                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                                    {(activity?.mcqActivities?.length || 0) + (activity?.contestActivities?.length || 0) + (activity?.registrationActivities?.length || 0)}
                                </p>
                            </div>
                            <div className="flex gap-6 sm:gap-8 text-center sm:text-left shrink-0">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Quizzes</p>
                                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">{activity?.mcqActivities?.length || 0}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Contests</p>
                                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{activity?.contestActivities?.length || 0}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Regs.</p>
                                    <p className="text-2xl font-black text-orange-600 dark:text-orange-400 leading-none">{activity?.registrationActivities?.length || 0}</p>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleDownloadReport}
                            disabled={isDownloading || isActivityLoading}
                            variant="outline"
                            className="relative z-10 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-all font-semibold px-6 py-4 h-auto shrink-0 text-sm gap-2 w-full lg:w-auto"
                        >
                            {isDownloading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <FileDown className="h-4 w-4" />
                            )}
                            <span className="lg:hidden xl:inline">Download</span> Report
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Details Sections */}
                        <div className="grid grid-cols-1 gap-6">
                            
                            {/* Contests Section */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-fit">
                                <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-x-auto scrollbar-hide px-2">
                                    <button className="py-4 px-6 text-sm font-bold text-indigo-600 border-b-2 border-indigo-600 flex items-center justify-center gap-2 min-w-[170px] bg-white dark:bg-slate-900">
                                        <Code2 className="h-4 w-4" /> Coding Contests
                                    </button>
                                </div>
                                <div className="p-0">
                                    {isActivityLoading ? (
                                        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
                                    ) : !activity?.contestActivities || activity.contestActivities.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Code2 className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                            <p className="font-semibold text-slate-500">No contests participated</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto scrollbar-hide">
                                            {activity.contestActivities.map(act => (
                                                <div key={act.contestId} className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-4">
                                                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                                                        <h4 className="font-bold text-slate-900 dark:text-white capitalize group-hover:text-indigo-600 transition-colors truncate">{act.title.toLowerCase()}</h4>
                                                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
                                                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider">{act.clubName || 'General'}</span>
                                                            <span className="flex gap-1"><span className="text-slate-400">Solved:</span> <span className="text-slate-700 dark:text-slate-300">{act.problemsSolved}/{act.totalProblems}</span></span>
                                                            <span className="flex gap-1"><span className="text-slate-400">Efficiency:</span> <span className="text-green-600">{act.totalProblems > 0 ? Math.round((act.problemsSolved / act.totalProblems) * 100) : 0}%</span></span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score</p>
                                                            <p className="text-xl font-black text-indigo-600 leading-none mt-0.5">{act.totalScore}</p>
                                                        </div>
                                                        <Link to={`/contests/${act.contestId}`} className="h-10 w-10 sm:h-8 sm:w-8 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Quiz & Registration Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Quizzes List */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[350px]">
                                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                                        <div className="h-8 w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center">
                                            <Trophy className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Quiz History</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-slate-900">
                                        {isActivityLoading ? (
                                             <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-yellow-600" /></div>
                                        ) : !activity?.mcqActivities || activity.mcqActivities.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full p-6 text-center opacity-70">
                                                <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                                                <p className="text-sm font-semibold text-slate-500">No quizzes taken</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-50 dark:divide-slate-800 p-2">
                                                {activity.mcqActivities.map(act => (
                                                    <div key={act.eventId} className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between gap-3 group">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-yellow-600 transition-colors">{act.title}</p>
                                                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">{act.clubName || 'General'}</span>
                                                                <span className="text-[10px] font-semibold text-slate-400">{act.submittedAt ? new Date(act.submittedAt).toLocaleDateString() : 'Pending'}</span>
                                                                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${act.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{act.status}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-sm font-black text-slate-900 dark:text-white">{act.score} <span className="text-slate-400 font-medium text-[10px]">/{act.totalMarks}</span></p>
                                                            {act.rank && <p className="text-[10px] font-bold text-yellow-600 mt-1">Rank #{act.rank}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Registration List */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[350px]">
                                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                                        <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                                            <FileQuestion className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Evaluations</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto scrollbar-hide bg-white dark:bg-slate-900">
                                        {isActivityLoading ? (
                                            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-orange-600" /></div>
                                        ) : !activity?.registrationActivities || activity.registrationActivities.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full p-6 text-center opacity-70">
                                                <GraduationCap className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                                                <p className="text-sm font-semibold text-slate-500">No registrations found</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-50 dark:divide-slate-800 p-2">
                                                {activity.registrationActivities.map(act => (
                                                    <div key={act.formId} className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between gap-3 group">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-orange-600 transition-colors">{act.title}</p>
                                                            <div className="flex flex-wrap gap-2 items-center mt-1.5">
                                                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">{act.clubName || 'General'}</span>
                                                                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${act.status === 'APPROVED' ? 'bg-green-100 text-green-700' : act.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                    {act.status}
                                                                </span>
                                                                <span className={`text-[8px] font-bold uppercase tracking-wider ${act.evaluationStatus === 'GRADED' ? 'text-green-600' : 'text-slate-400'}`}>
                                                                    {act.evaluationStatus}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {act.evaluationStatus === 'GRADED' ? (
                                                            <div className="text-right shrink-0 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-xl">
                                                                <p className="text-sm font-black text-slate-900 dark:text-white">{act.score} <span className="text-slate-400 font-medium text-[10px]">/{act.totalMarks}</span></p>
                                                            </div>
                                                        ) : (
                                                            <div className="text-right shrink-0 px-2 py-1">
                                                                <p className="text-[10px] font-semibold text-slate-400 italic">Pending</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
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
