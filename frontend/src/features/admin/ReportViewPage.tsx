import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    ChevronLeft, FileText, Calendar, 
    Clock, MapPin, Users, Trophy, ExternalLink, 
    Download, Target, Info, Shield, Award,
    CheckCircle2, MessageSquare, RotateCcw, User
} from 'lucide-react';
import { CreateReportDialog } from './components/CreateReportDialog';
import { DeleteButton } from '@/components/DeleteButton';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { toast } from 'sonner';
import type { Report } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';

export default function ReportViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showAttendance, setShowAttendance] = useState(false);
    const [feedbackSubmissions, setFeedbackSubmissions] = useState<any[]>([]);
    const [feedbackForm, setFeedbackForm] = useState<any>(null);
    const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        if (id) fetchReport();
    }, [id]);

    useEffect(() => {
        if (showFeedback && report && !feedbackForm) {
            fetchFeedbackData();
        }
    }, [showFeedback, report]);

    const fetchFeedbackData = async () => {
        if (!report) return;
        try {
            // Find the associated form first
            const formsRes = await api.get('/api/registration/forms');
            const targetForm = formsRes.data.find((f: any) => 
                f.id === report.eventId || f.eventId === report.eventId || f.contestId === report.eventId
            );

            if (targetForm) {
                setFeedbackForm(targetForm);
                const responsesRes = await api.get(`/api/feedback/${targetForm.id}/responses`);
                setFeedbackSubmissions(responsesRes.data);
            } else {
                toast.error('No feedback form found for this event');
            }
        } catch (error) {
            console.error('Failed to load feedback', error);
        }
    };

    const fetchReport = async () => {
        try {
            const response = await api.get(`/api/reports/${id}`);
            const data = response.data;
            
            // Critical Fix: Sanitize data to ensure arrays are never null/undefined
            // This prevents "cannot read property 'length' of null" errors
            const sanitizedReport = {
                ...data,
                eventId: data.eventId || '',
                eventType: data.eventType || '',
                participants: Array.isArray(data.participants) ? data.participants : [],
                winners: Array.isArray(data.winners) ? data.winners : [],
                photographs: Array.isArray(data.photographs) ? data.photographs : [],
                photoPublicIds: Array.isArray(data.photoPublicIds) ? data.photoPublicIds : [],
                noticeUrl: data.noticeUrl || '',
                posterUrl: data.posterUrl || '',
                objective: data.objective || '',
                impactAnalysis: data.impactAnalysis || '',
                resourcePerson: data.resourcePerson || '',
                socialMediaLinks: Array.isArray(data.socialMediaLinks) 
                    ? data.socialMediaLinks.filter((l: any) => typeof l === 'string') 
                    : [],
                facultyCoordinators: Array.isArray(data.facultyCoordinators) ? data.facultyCoordinators : [],
                studentCoordinators: Array.isArray(data.studentCoordinators) ? data.studentCoordinators : []
            };

            setReport(sanitizedReport);
        } catch (error) {
            toast.error('Failed to fetch report');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteReport = async () => {
        if (!id) return;
        
        try {
            await api.delete(`/api/reports/${id}`);
            toast.success('Report deleted successfully');
            navigate('/admin/reports');
        } catch (error) {
            console.error('Failed to delete report', error);
            toast.error('Failed to delete report');
        }
    };

    const handleDownloadPDF = async () => {
        if (!report) return;

        const toastId = toast.loading('Preparing your wide-format PDF...');
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // 1. Header with Gradient Effect (using rectangles)
            doc.setFillColor(30, 41, 59); // dark slate 800
            doc.rect(0, 0, pageWidth, 50, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(26);
            doc.setFont('helvetica', 'bold');
            doc.text('CAMPUS ARENA', pageWidth / 2, 20, { align: 'center' });
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text('OFFICIAL EVENT COMPLETION REPORT', pageWidth / 2, 30, { align: 'center' });
            
            doc.setFontSize(10);
            doc.setTextColor(148, 163, 184); // slate-400
            doc.text(`ID: #${report.id.toUpperCase()}`, pageWidth / 2, 40, { align: 'center' });

            let yPos = 65;

            // 2. Primary Details Section
            doc.setTextColor(15, 23, 42); // slate-900
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(report.eventName, 15, yPos);
            yPos += 10;

            doc.setFontSize(11);
            doc.setTextColor(100, 116, 139); // slate-500
            doc.setFont('helvetica', 'normal');
            doc.text(`Organized by ${report.clubName || 'Institution'}${report.subClubName ? ` — ${report.subClubName}` : ''} | ${report.eventType} Event | CAMPUS ARENA`, 15, yPos);
            yPos += 15;

            // 3. Stats Banner
            autoTable(doc, {
                startY: yPos,
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
                columns: [
                    { header: 'DATE', dataKey: 'date' },
                    { header: 'TIME', dataKey: 'time' },
                    { header: 'VENUE', dataKey: 'venue' },
                    { header: 'RESOURCE PERSON', dataKey: 'resourcePerson' },
                    { header: 'PARTICIPANTS', dataKey: 'participants' }
                ],
                body: [[
                    new Date(report.date).toLocaleDateString(undefined, { dateStyle: 'long' }),
                    report.time,
                    report.venue || 'TBD/Online',
                    (report as any).resourcePerson || 'N/A',
                    report.participants.length.toString()
                ]],
                margin: { left: 15, right: 15 }
            });

            yPos = (doc as any).lastAutoTable.finalY + 15;

            // 4. Content Sections
            const drawSection = (title: string, content: string) => {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(79, 70, 229);
                doc.text(title, 15, yPos);
                yPos += 7;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(51, 65, 85);
                const lines = doc.splitTextToSize(content || 'Not provided', pageWidth - 30);
                doc.text(lines, 15, yPos);
                yPos += (lines.length * 5) + 12;
            };

            drawSection('EXECUTIVE OBJECTIVE', report.objective);
            if (report.impactAnalysis) {
                drawSection('IMPACT ANALYSIS / OUTCOME', report.impactAnalysis);
            }
            drawSection('EVENT SUMMARY', report.description);

            // 5. Winners Highlight (Top 3)
            if (report.winners?.length > 0) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
                doc.text('CAMPUS ARENA | TOP 3 WINNERS', 15, yPos);
                yPos += 8;

                autoTable(doc, {
                    startY: yPos,
                    theme: 'striped',
                    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
                    columns: [
                        { header: 'RANK', dataKey: 'rank' },
                        { header: 'NAME', dataKey: 'name' },
                        { header: 'ROLL NO', dataKey: 'rollNo' },
                        { header: 'COURSE', dataKey: 'course' },
                        { header: 'BRANCH/SEC', dataKey: 'branchSec' },
                        { header: 'SCORE', dataKey: 'score' }
                    ],
                    body: report.winners.slice(0, 3).map((w, i) => ({
                        rank: i + 1,
                        name: w.name,
                        rollNo: w.rollNumber,
                        course: w.course,
                        branchSec: `${w.branch} / ${w.section || 'N/A'}`,
                        score: w.score
                    })),
                    margin: { left: 15, right: 15 }
                });
                yPos = (doc as any).lastAutoTable.finalY + 15;
            }

            // 6. Attendance List (Conditional)
            if (showAttendance && report.participants.length > 0) {
                if (yPos > pageHeight - 60) { doc.addPage(); yPos = 20; }
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
                doc.text('PARTICIPANT LIST / ATTENDANCE', 15, yPos);
                yPos += 8;

                autoTable(doc, {
                    startY: yPos,
                    theme: 'grid',
                    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
                    columns: [
                        { header: 'NAME', dataKey: 'name' },
                        { header: 'ROLL NO', dataKey: 'rollNo' },
                        { header: 'COURSE/BRANCH', dataKey: 'courseBranch' },
                        { header: 'SEC', dataKey: 'sec' },
                        { header: 'SCORE', dataKey: 'score' }
                    ],
                    body: report.participants.map(p => ({
                        name: p.name,
                        rollNo: p.rollNumber,
                        courseBranch: `${p.course} / ${p.branch}`,
                        sec: p.section || 'N/A',
                        score: p.score
                    })),
                    styles: { fontSize: 8 },
                    margin: { left: 15, right: 15 }
                });
                yPos = (doc as any).lastAutoTable.finalY + 15;
            }

            // 7. Feedback Details (Conditional)
            if (showFeedback && feedbackSubmissions.length > 0 && feedbackForm?.feedbackQuestions) {
                if (yPos > pageHeight - 100) { doc.addPage(); yPos = 20; }
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
                doc.text('EVENT FEEDBACK SUMMARY', 15, yPos);
                yPos += 8;

                feedbackForm.feedbackQuestions.forEach((q: any) => {
                    if (yPos > pageHeight - 60) { doc.addPage(); yPos = 20; }
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(79, 70, 229);
                    doc.text(`QUESTION: ${q.label.toUpperCase()}`, 15, yPos);
                    yPos += 6;

                    const relevantAnswers = feedbackSubmissions
                        .map(s => s.answers[q.id])
                        .filter(a => a)
                        .map((ans, idx) => ({
                            idx: idx + 1,
                            response: Array.isArray(ans) ? ans.join(', ') : String(ans)
                        }));

                    autoTable(doc, {
                        startY: yPos,
                        theme: 'striped',
                        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontSize: 8 },
                        bodyStyles: { fontSize: 8 },
                        columns: [
                            { header: '#', dataKey: 'idx' },
                            { header: 'PARTICIPANT RESPONSE', dataKey: 'response' }
                        ],
                        body: relevantAnswers,
                        margin: { left: 15, right: 15 }
                    });
                    yPos = (doc as any).lastAutoTable.finalY + 12;
                });
            }

            // 8. Signature Section
            if (yPos > pageHeight - 40) { doc.addPage(); yPos = 20; }
            yPos += 20;
            doc.setDrawColor(200, 200, 200);
            doc.line(15, yPos, 65, yPos);
            doc.line(75, yPos, 125, yPos);
            doc.line(135, yPos, 185, yPos);
            
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('FACULTY COORDINATOR', 40, yPos + 5, { align: 'center' });
            doc.text('STUDENT COORDINATOR', 100, yPos + 5, { align: 'center' });
            doc.text('CLUB SECRETARY', 160, yPos + 5, { align: 'center' });

            // 9. Page Numbers
            const totalPages = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184);
                doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                doc.text('Campus Arena Report Infrastructure © 2026', 15, pageHeight - 10);
            }

            // 9. Attach Poster and Notice to PDF
            const addImageToPdf = async (url: string, title: string) => {
                try {
                    const img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.src = url;
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                    });
                    
                    doc.addPage();
                    doc.setFillColor(30, 41, 59);
                    doc.rect(0, 0, pageWidth, 20, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(10);
                    doc.text(`CAMPUS ARENA - EVENT DOCUMENTATION: ${title.toUpperCase()}`, pageWidth / 2, 12, { align: 'center' });
                    
                    const padding = 20;
                    const availableWidth = pageWidth - (padding * 2);
                    const availableHeight = pageHeight - 40;
                    const ratio = Math.min(availableWidth / img.width, availableHeight / img.height);
                    const width = img.width * ratio;
                    const height = img.height * ratio;
                    
                    doc.addImage(img, 'JPEG', (pageWidth - width) / 2, 30, width, height);
                } catch (e) {
                    console.error(`Failed to add ${title} Image to PDF`, e);
                }
            };

            if ((report as any).noticeUrl) await addImageToPdf((report as any).noticeUrl, 'Official Notice');
            if ((report as any).posterUrl) await addImageToPdf((report as any).posterUrl, 'Event Poster');

            // 10. Photographs Gallery in PDF
            if ((report as any).photographs?.length > 0) {
                doc.addPage();
                doc.setFillColor(30, 41, 59);
                doc.rect(0, 0, pageWidth, 20, 'F');
                doc.setTextColor(255, 255, 255);
                doc.text(`CAMPUS ARENA - EVENT HIGHLIGHTS / PHOTOGRAPHS`, pageWidth / 2, 12, { align: 'center' });
                
                let photoY = 30;
                for (const photoUrl of (report as any).photographs) {
                    if (photoY > pageHeight - 100) {
                        doc.addPage();
                        photoY = 20;
                    }
                    try {
                        const img = new Image();
                        img.crossOrigin = 'Anonymous';
                        img.src = photoUrl;
                        await new Promise((resolve, reject) => {
                            img.onload = resolve;
                            img.onerror = reject;
                        });
                        const ratio = 60 / img.height;
                        const width = img.width * ratio;
                        doc.addImage(img, 'JPEG', (pageWidth - width) / 2, photoY, width, 60);
                        photoY += 70;
                    } catch (e) {
                        console.error('Failed to add photograph to PDF', e);
                    }
                }
            }

            doc.save(`${report.eventName.replace(/\s+/g, '_')}_Completion_Report.pdf`);
            toast.success('Professional Full-Width Report Saved', { id: toastId });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate PDF. Check console.', { id: toastId });
        }
    };



    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Report not found</h2>
                <Button onClick={() => navigate('/admin/reports')} className="mt-4 bg-indigo-600">
                    Back to Reports
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Header / Actions - Concise & Glassmorphic */}
            <div className="sticky top-0 z-[50] w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 no-print">
                <div className="w-full px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate('/admin/reports')}
                            className="group flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl h-10 px-4"
                        >
                            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            Return
                        </Button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                        
                        {/* Interactive Toggles */}
                        <div className="hidden md:flex items-center gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Feedback</span>
                                <div 
                                    onClick={() => setShowFeedback(!showFeedback)}
                                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${showFeedback ? 'bg-amber-500 shadow-sm shadow-amber-200' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${showFeedback ? 'left-6' : 'left-1'}`} />
                                </div>
                            </label>
                            
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Attendance</span>
                                <div 
                                    onClick={() => setShowAttendance(!showAttendance)}
                                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${showAttendance ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${showAttendance ? 'left-6' : 'left-1'}`} />
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2">

                        <Button 
                            onClick={() => setShowRegenerateDialog(true)}
                            variant="outline"
                            className="bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-800 text-indigo-600 font-bold hover:bg-indigo-50"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Regenerate
                        </Button>
                        <DeleteButton 
                            onClick={() => setShowDeleteDialog(true)}
                            variant="full"
                            label="Delete Report"
                            className="bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white"
                        />
                        <Button 
                            onClick={handleDownloadPDF}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 dark:shadow-none"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Report Document - Full Width */}
            <div className="w-full px-6 py-8">
                <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardContent className="p-0">
                        {/* 1. Header Section - Premium Branding */}
                        <div className="p-10 md:p-14 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                                <div className="space-y-6 flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                                        <h2 className="text-[10px] font-black tracking-[0.2em] text-indigo-600 dark:text-indigo-400 uppercase">Authenticated System Report</h2>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                                            <span className="text-indigo-600">CAMPUS ARENA</span> | {report.eventName}
                                        </h1>
                                        <div className="flex flex-wrap gap-6 text-sm font-bold text-slate-500">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-700">
                                                <Award className="h-4 w-4 text-indigo-500" />
                                                <span className="text-slate-900 dark:text-white">{report.clubName || 'INSTITUTION'}</span>
                                            </div>
                                            {report.subClubName && (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-2xl shadow-sm ring-1 ring-blue-200 dark:ring-blue-800">
                                                    <Award className="h-4 w-4 text-blue-500" />
                                                    <span className="text-blue-700 dark:text-blue-300 font-bold">{report.subClubName}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-700">
                                                <FileText className="h-4 w-4 text-slate-400" />
                                                <span className="uppercase tracking-tighter">Event Category: {report.eventType}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="w-full lg:w-auto flex flex-col items-end gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unique Report Signature</p>
                                        <div className="text-3xl font-black text-indigo-600 font-mono tracking-tighter">
                                            REG-{report.id.slice(-6).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 min-w-[240px]">
                                        <div className="flex justify-between w-full mb-1">
                                            <span className="text-[10px] font-black text-slate-400">CREATION DATE</span>
                                            <span className="text-[10px] font-bold text-slate-900 dark:text-white">{new Date(report.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <span className="text-[10px] font-black text-slate-400">GENERATED BY</span>
                                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">{report.createdBy}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Key Performance Indicators (Metrics) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800">
                            {[
                                { icon: Calendar, label: 'Execution Date', value: new Date(report.date).toLocaleDateString(undefined, { dateStyle: 'full' }), color: 'text-indigo-500', bg: 'bg-indigo-50/50' },
                                { icon: User, label: 'Resource Person', value: (report as any).resourcePerson || 'Internal Resource', color: 'text-violet-500', bg: 'bg-violet-50/50' },
                                { icon: MapPin, label: 'Geo Location', value: report.venue || 'Virtual / Multi-Location', color: 'text-rose-500', bg: 'bg-rose-50/50' },
                                { icon: Users, label: 'Total Engagement', value: `${report.participants.length} Participants`, color: 'text-emerald-500', bg: 'bg-emerald-50/50' }
                            ].map((item, i) => (
                                <div key={i} className="p-8 group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-default">
                                    <div className={`w-10 h-10 ${item.bg} dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <item.icon className={`h-5 w-5 ${item.color}`} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{item.label}</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* 3. Narrative Documentation */}
                        <div className="p-10 md:p-14 space-y-20">
                            <div className="space-y-16">
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
                                        <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">Core Objective</h3>
                                    </div>
                                    <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        {report.objective}
                                    </p>
                                </section>
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-1.5 bg-emerald-500 rounded-full"></div>
                                        <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">Impact Analysis</h3>
                                    </div>
                                    <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        {report.impactAnalysis || 'Impact documentation and outcome analysis not provided for this report.'}
                                    </p>
                                </section>
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-1.5 bg-slate-400 rounded-full"></div>
                                        <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">Detailed Summary</h3>
                                    </div>
                                    <p className="text-base text-slate-500 dark:text-slate-400 leading-loose">
                                        {report.description}
                                    </p>
                                </section>
                            </div>

                            {/* Event Photographs Gallery */}
                            {(report as any).photographs?.length > 0 && (
                                <section className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-1.5 bg-amber-500 rounded-full"></div>
                                        <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">Event Photographs</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(report as any).photographs.map((photo: string, index: number) => (
                                            <div key={index} className="group relative aspect-video rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 shadow-sm hover:shadow-xl transition-all duration-500">
                                                <img 
                                                    src={photo} 
                                                    alt={`Event photo ${index + 1}`} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                                    <p className="text-white text-xs font-bold uppercase tracking-widest">Enlarge Photograph</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Official Notice & Event Poster Section */}
                            {((report as any).noticeUrl || (report as any).posterUrl) && (
                                <section className="space-y-8 mt-12">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-1.5 bg-indigo-500 rounded-full"></div>
                                        <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">Compliance & Promotion</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {(report as any).noticeUrl && (
                                            <div className="space-y-4">
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Official Notice</p>
                                                <div className="rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
                                                    <img 
                                                        src={(report as any).noticeUrl} 
                                                        alt="Official Notice" 
                                                        className="w-full h-auto object-contain max-h-[500px] p-4"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {(report as any).posterUrl && (
                                            <div className="space-y-4">
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Event Poster</p>
                                                <div className="rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
                                                    <img 
                                                        src={(report as any).posterUrl} 
                                                        alt="Event Poster" 
                                                        className="w-full h-auto object-contain max-h-[500px]"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* 4. Podium Winners Section */}
                            {report.winners.length > 0 && (
                                <section className="space-y-12 bg-slate-50/50 dark:bg-slate-950/30 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                                    <div className="text-center space-y-1">
                                        <Trophy className="h-6 w-6 text-amber-500 mx-auto" />
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Campus Arena Top 3 Winners</h3>
                                        <p className="text-xs font-bold text-slate-400">Official recognition for outstanding performance</p>
                                    </div>
                                    
                                    <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100 dark:bg-slate-800">
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Rank</th>
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Name</th>
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Roll No</th>
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Course / Branch</th>
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-right">Score</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {report.winners.slice(0, 3).map((winner, idx) => (
                                                    <tr key={idx} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                                                                idx === 0 ? 'bg-amber-100 text-amber-700' : 
                                                                idx === 1 ? 'bg-slate-100 text-slate-600' : 
                                                                'bg-orange-100 text-orange-700'
                                                            }`}>
                                                                {idx + 1}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{winner.name}</td>
                                                        <td className="px-6 py-4 text-sm font-mono text-slate-500">{winner.rollNumber}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-500">{winner.course} / {winner.branch} ({winner.section || 'N/A'})</td>
                                                        <td className="px-6 py-4 text-sm font-black text-indigo-600 text-right">{winner.score}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {/* 5. Participants Grid (Conditional) */}
                            {showAttendance && (
                                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                                    <div className="flex items-center gap-4">
                                        <Users className="h-6 w-6 text-emerald-500" />
                                        <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Authenticated Participants</h3>
                                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-black">{report.participants.length}</span>
                                    </div>
                                    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100 dark:bg-slate-800">
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">#</th>
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Name</th>
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Roll No</th>
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Course / Branch</th>
                                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase text-right">Score/Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {report.participants.map((participant, i) => (
                                                    <tr key={i} className="bg-white dark:bg-slate-900 hover:bg-emerald-50/10 transition-colors">
                                                        <td className="px-6 py-4 text-xs text-slate-400">{i + 1}</td>
                                                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{participant.name}</td>
                                                        <td className="px-6 py-4 text-sm font-mono text-slate-500">{participant.rollNumber}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-500">{participant.course} / {participant.branch} ({participant.section || 'N/A'})</td>
                                                        <td className="px-6 py-4 text-sm font-black text-emerald-600 text-right">{participant.score}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {/* 6. Feedback Analysis (Conditional) */}
                            {showFeedback && (
                                <section className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500 pt-10 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <MessageSquare className="h-6 w-6 text-amber-500" />
                                        <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Participant Feedback Analysis</h3>
                                        <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-black">{feedbackSubmissions.length} Responses</span>
                                    </div>

                                    {feedbackSubmissions.length > 0 ? (
                                        <div className="space-y-12">
                                            {feedbackForm?.feedbackQuestions?.map((q: any) => (
                                                <div key={q.id} className="space-y-4">
                                                    <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                                        {q.label}
                                                    </div>
                                                    <div className="space-y-2">
                                                        {feedbackSubmissions.map((sub, idx) => {
                                                            const ans = sub.answers[q.id];
                                                            if (!ans) return null;
                                                            return (
                                                                <div key={idx} className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black shrink-0">#{idx+1}</div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-sm text-slate-700 dark:text-slate-300 italic font-medium">
                                                                            "{Array.isArray(ans) ? ans.join(', ') : String(ans)}"
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center bg-slate-50 dark:bg-slate-950/20 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                                            <p className="text-slate-400 font-bold">No feedback submissions discovered for this activity instance.</p>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* 7. Coordination Registry */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-100 dark:border-slate-800 pt-20">
                                {[
                                    { role: 'Faculty', items: report.facultyCoordinators, color: 'text-indigo-500', bg: 'bg-indigo-50/50' },
                                    { role: 'Student', items: report.studentCoordinators, color: 'text-emerald-500', bg: 'bg-emerald-50/50' }
                                ].map((team) => (
                                    <div key={team.role} className="space-y-6">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{team.role} Registry</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {team.items?.length ? team.items.map((name, i) => (
                                                <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                                    <div className={`w-2 h-2 rounded-full ${team.color.replace('text-', 'bg-')}`}></div>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">{name}</span>
                                                </div>
                                            )) : <span className="text-xs text-slate-400 italic font-bold">No registry entries.</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 8. Official Signatures Section - Only in wide/full view */}
                            <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
                                {['Faculty Coordinator', 'Student Coordinator', 'Club Secretary'].map((label) => (
                                    <div key={label} className="text-center space-y-4">
                                        <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="mt-12 flex flex-col items-center gap-4 no-print">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">
                        Campus Arena Digital Ecosystem &copy; {new Date().getFullYear()}
                    </p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1 h-1 bg-slate-200 rounded-full"></div>)}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .px-6 { padding-left: 0 !important; padding-right: 0 !important; }
                    .py-8 { padding-top: 0 !important; padding-bottom: 0 !important; }
                    .rounded-3xl { border-radius: 0 !important; }
                    .shadow-2xl { shadow: none !important; }
                    .ring-1 { border: none !important; }
                }
                .animate-in {
                    animation: slideIn 0.5s ease-out forwards;
                }
                @keyframes slideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
            <CreateReportDialog
                isOpen={showRegenerateDialog}
                onClose={() => setShowRegenerateDialog(false)}
                eventId={report.eventId}
                eventTitle={report.eventName}
                eventType={report.eventType as any}
                initialObjective={report.objective}
                initialImpactAnalysis={report.impactAnalysis}
                initialSocialLinks={report.socialMediaLinks}
                initialPhotographs={(report as any).photographs}
                initialPhotoPublicIds={(report as any).photoPublicIds}
                reportId={report.id}
                onSuccess={() => {
                    setShowRegenerateDialog(false);
                    fetchReport();
                }}
            />
            <DeleteConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDeleteReport}
                title={report?.eventName || 'This Report'}
                itemType="Report"
            />
        </div>
    );
}
