import { useState } from 'react';
import { api } from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap, ChevronRight, FileDown,
    Users, Search, Loader2, ArrowLeft,
    LayoutGrid, List, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { User, UserActivity } from '@/types';

interface UserWithActivity {
    user: User;
    activity: UserActivity;
}

interface CollectiveActivityResponse {
    users: UserWithActivity[];
}

const COURSES = [
    { value: 'BTECH', label: 'B.Tech', duration: 4 },
    { value: 'BIOTECH', label: 'Biotech', duration: 4 },
    { value: 'BCA', label: 'BCA', duration: 3 },
    { value: 'BBA', label: 'BBA', duration: 3 },
    { value: 'DIPLOMA', label: 'Diploma', duration: 3 },
    { value: 'MBA', label: 'MBA', duration: 2 },
    { value: 'BCOM', label: 'B.Com', duration: 3 }
];

export default function AdminCollectiveDetails() {
    const [step, setStep] = useState<'course' | 'year' | 'section' | 'data'>('course');
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [selectedYearIndex, setSelectedYearIndex] = useState<number | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [collectiveData, setCollectiveData] = useState<UserWithActivity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    const getCurrentSession = () => {
        const now = new Date();
        const month = now.getMonth();
        const currentYear = now.getFullYear();
        // Academic session starts in July/August. 
        // If it's Jan-June, current session started last year.
        const startYear = month < 6 ? currentYear - 1 : currentYear;
        return startYear;
    };

    const getSessionForYear = (yearIndex: number) => {
        const startYearOfCurrentFirstYear = getCurrentSession();
        const courseObj = COURSES.find(c => c.value === selectedCourse);
        const duration = courseObj?.duration || 4;

        // If yearIndex = 1 (1st year), session start is current session start.
        // If yearIndex = 2 (2nd year), session start was 1 year before current first year.
        const targetStartYear = startYearOfCurrentFirstYear - (yearIndex - 1);
        const targetEndYear = targetStartYear + duration;
        const targetEndYearShort = targetEndYear % 100;
        return `${targetStartYear}-${targetEndYearShort.toString().padStart(2, '0')}`;
    };

    const handleCourseSelect = (course: string) => {
        setSelectedCourse(course);
        setStep('year');
    };

    const handleYearSelect = (year: number) => {
        setSelectedYearIndex(year);
        setStep('section');
    };

    const handleAllBatchesSelect = () => {
        setSelectedYearIndex(null);
        setSelectedSection(null);
        fetchCollectiveData(selectedCourse!, null, null);
        setStep('data');
    };

    const handleSectionSelect = (section: string | null) => {
        setSelectedSection(section);
        const session = getSessionForYear(selectedYearIndex!);
        fetchCollectiveData(selectedCourse!, session, section);
        setStep('data');
    };

    const fetchCollectiveData = async (course: string, session: string | null, section: string | null) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                course: course,
            });
            if (session) params.append('session', session);
            if (section) params.append('section', section);

            const response = await api.get<CollectiveActivityResponse>(`/user/collective-activity?${params.toString()}`);
            setCollectiveData(response.data.users);
        } catch (error) {
            toast.error("Failed to fetch collective data");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadCollectiveReport = async () => {
        if (collectiveData.length === 0) return;
        setIsDownloading(true);

        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            const timestamp = new Date().toLocaleString();
            const session = selectedYearIndex ? getSessionForYear(selectedYearIndex!) : 'All Batches';

            doc.setFillColor(37, 99, 235);
            doc.rect(0, 0, 297, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("COLLECTIVE PERFORMANCE REPORT", 20, 25);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Generated on: ${timestamp}`, 20, 32);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.text(`Course: ${selectedCourse}`, 20, 50);
            doc.text(`Academic Batch (Session): ${session}`, 100, 50);
            doc.text(`Section: ${selectedSection || 'All'}`, 180, 50);
            doc.text(`Total Students: ${collectiveData.length}`, 20, 60);

            const tableRows = collectiveData.map((data, index) => {
                const quizCount = data.activity.mcqActivities.length;
                const contestCount = data.activity.contestActivities.length;
                const regCount = data.activity.registrationActivities.length;

                const avgQuizScore = quizCount > 0
                    ? (data.activity.mcqActivities.reduce((acc, curr) => acc + (curr.score || 0), 0) / quizCount).toFixed(1)
                    : "0";

                const totalContestScore = data.activity.contestActivities.reduce((acc, curr) => acc + curr.totalScore, 0);

                return [
                    index + 1,
                    data.user.rollNumber || 'N/A',
                    `${data.user.firstName} ${data.user.lastName}`,
                    quizCount,
                    avgQuizScore,
                    contestCount,
                    totalContestScore,
                    regCount
                ];
            });

            autoTable(doc, {
                startY: 70,
                head: [['#', 'Roll Number', 'Student Name', 'Quizzes', 'Avg Quiz', 'Contests', 'Avg Contest', 'Registrations']],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 247, 250] },
                styles: { fontSize: 9, halign: 'center' },
                columnStyles: {
                    2: { halign: 'left', fontStyle: 'bold' }
                }
            });

            doc.save(`Collective_Report_${selectedCourse}_Batch_${session}_${selectedSection || 'All'}.pdf`);
            toast.success("Collective report downloaded successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF");
        } finally {
            setIsDownloading(false);
        }
    };

    const filteredData = collectiveData.filter(data =>
        data.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (data.user.rollNumber && data.user.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getYearLabel = (index: number) => {
        return `${index}${index === 1 ? 'st' : index === 2 ? 'nd' : index === 3 ? 'rd' : 'th'} yr`;
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-20">
            {/* Navigation Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 p-4 mb-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {step !== 'course' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (step === 'year') setStep('course');
                                    else if (step === 'section') setStep('year');
                                    else if (step === 'data') setStep('section');
                                }}
                                className="h-10 w-10 p-0 rounded-full"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        )}
                        <div>
                            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Collective Details</h1>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                <span className={step === 'course' ? 'text-blue-600' : ''}>Course</span>
                                {selectedCourse && <> <ChevronRight className="h-3 w-3" /> <span className={step === 'year' ? 'text-blue-600' : ''}>Year</span> </>}
                                {selectedYearIndex && <> <ChevronRight className="h-3 w-3" /> <span className={step === 'section' ? 'text-blue-600' : ''}>Section</span> </>}
                                {step === 'data' && <> <ChevronRight className="h-3 w-3" /> <span className="text-blue-600">Report</span> </>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                <AnimatePresence mode="wait">
                    {/* Course Selection */}
                    {step === 'course' && (
                        <motion.div
                            key="step-course"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {COURSES.map((course) => (
                                <button
                                    key={course.value}
                                    onClick={() => handleCourseSelect(course.value)}
                                    className="group relative p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-500 transition-all text-left overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-500/5 rounded-full group-hover:bg-blue-500/10 transition-colors"></div>
                                    <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                        <GraduationCap className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{course.label}</h3>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{course.duration} Year Comprehensive Duration</p>
                                    <div className="mt-8 flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Select Course</span>
                                        <ChevronRight className="h-5 w-5 text-blue-600 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {/* Year Selection */}
                    {step === 'year' && (
                        <motion.div
                            key="step-year"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {Array.from({ length: COURSES.find(c => c.value === selectedCourse)?.duration || 4 }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleYearSelect(i + 1)}
                                    className="group p-10 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition-all text-center"
                                >
                                    <div className="h-16 w-16 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:rotate-12 transition-transform">
                                        <Calendar className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{i + 1}</h3>
                                    <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Year</p>
                                </button>
                            ))}
                            <button
                                onClick={handleAllBatchesSelect}
                                className="col-span-full mt-6 p-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-[2rem] shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-4 group"
                            >
                                <Users className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                                <span className="text-lg font-black uppercase tracking-widest">View All Students (Global)</span>
                            </button>
                        </motion.div>
                    )}

                    {/* Section Selection */}
                    {step === 'section' && (
                        <motion.div
                            key="step-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl mx-auto space-y-6"
                        >
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Select Section</h2>
                                <p className="text-gray-500 mt-2 font-medium">Choose a specific section or view all students for this year.</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {['A', 'B', 'C', 'D', 'E'].map((sec) => (
                                    <button
                                        key={sec}
                                        onClick={() => handleSectionSelect(sec)}
                                        className="p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-center group"
                                    >
                                        <span className="text-4xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{sec}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleSectionSelect(null)}
                                    className="col-span-full p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all font-black uppercase tracking-widest"
                                >
                                    View All Sections
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Data Visualization */}
                    {step === 'data' && (
                        <motion.div
                            key="step-data"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                        >
                            {/* Dashboard Header */}
                            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-500/30">
                                        {selectedSection || 'ALL'}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                                            {selectedCourse} {selectedYearIndex ? `- ${getYearLabel(selectedYearIndex!)}` : '(All Batches)'}
                                        </h2>
                                        <p className="text-gray-500 font-medium">
                                            {selectedYearIndex ? `Session: ${getSessionForYear(selectedYearIndex!)}` : 'Comprehensive View'} • {collectiveData.length} Students
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search roll or name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-11 pr-4 py-6 w-full sm:w-64 rounded-2xl border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                    <div className="flex bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600' : 'text-gray-400'}`}
                                        >
                                            <LayoutGrid className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600' : 'text-gray-400'}`}
                                        >
                                            <List className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <Button
                                        onClick={handleDownloadCollectiveReport}
                                        disabled={isDownloading || isLoading || filteredData.length === 0}
                                        className="h-auto py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center gap-3 shadow-lg shadow-blue-500/20"
                                    >
                                        {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5" />}
                                        Download Collective PDF
                                    </Button>
                                </div>
                            </div>

                            {/* Main List */}
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-40">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                                    <p className="text-gray-500 font-bold animate-pulse">Analyzing student performance data...</p>
                                </div>
                            ) : filteredData.length === 0 ? (
                                <div className="text-center py-40 opacity-30">
                                    <Users className="h-20 w-20 mx-auto mb-6" />
                                    <h3 className="text-2xl font-black">No Students Found</h3>
                                    <p>No students found for this selection.</p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredData.map(({ user, activity }) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={user.id}
                                            className="group relative bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 h-full flex flex-col"
                                        >
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-xl font-black text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-600 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:text-white transition-all duration-500">
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{user.firstName} {user.lastName}</h4>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{user.rollNumber}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3 mb-6">
                                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Quizzes</p>
                                                    <p className="text-lg font-black text-blue-600">{activity.mcqActivities.length}</p>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Contests</p>
                                                    <p className="text-lg font-black text-indigo-600">{activity.contestActivities.length}</p>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Graded</p>
                                                    <p className="text-lg font-black text-orange-600">{activity.registrationActivities.filter(a => a.evaluationStatus === 'GRADED').length}</p>
                                                </div>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance Index</span>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <div className="h-1.5 w-24 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-600 transition-all duration-1000"
                                                                style={{ width: `${Math.min(100, (activity.mcqActivities.reduce((acc, curr) => acc + (curr.score || 0), 0) / (activity.mcqActivities.length || 1) * 2))}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                            {activity.mcqActivities.length > 0 ? (activity.mcqActivities.reduce((acc, curr) => acc + (curr.score || 0), 0) / activity.mcqActivities.length).toFixed(1) : '0.0'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={() => window.open(`/admin/users/${user.id}`, '_blank')} className="h-10 w-10 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600">
                                                    <ChevronRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-4 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-50 dark:border-gray-700">
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Roll Number</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quizzes</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contests</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Quiz Score</th>
                                                <th className="px-6 py-5 text-right font-black text-gray-400 uppercase tracking-widest">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                            {filteredData.map(({ user, activity }) => (
                                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 text-xs">
                                                                {user.firstName[0]}{user.lastName[0]}
                                                            </div>
                                                            <span className="font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm font-medium text-gray-500">{user.rollNumber}</td>
                                                    <td className="px-6 py-5">
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-xs font-black">{activity.mcqActivities.length}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-black">{activity.contestActivities.length}</span>
                                                    </td>
                                                    <td className="px-6 py-5 font-black text-blue-600">
                                                        {activity.mcqActivities.length > 0 ? (activity.mcqActivities.reduce((acc, curr) => acc + (curr.score || 0), 0) / activity.mcqActivities.length).toFixed(1) : '–'}
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => window.open(`/admin/users/${user.id}`, '_blank')} className="font-bold text-blue-600 hover:text-blue-700">
                                                            Full Profile
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
