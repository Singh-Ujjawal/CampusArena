import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
    ChevronLeft, Printer, FileText, Calendar, 
    Clock, MapPin, Users, Trophy, ExternalLink, 
    Download, Target, Info, Shield, Award,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Report } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) fetchReport();
    }, [id]);

    const fetchReport = async () => {
        try {
            const response = await api.get(`/api/reports/${id}`);
            setReport(response.data);
        } catch (error) {
            toast.error('Failed to fetch report');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!report) return;

        const toastId = toast.loading('Preparing your PDF...');
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // 1. Header
            doc.setFillColor(67, 56, 202); // indigo-700
            doc.rect(0, 0, pageWidth, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('CAMPUS ARENA EVENT REPORT', pageWidth / 2, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Report ID: #${report.id.toUpperCase()}`, pageWidth / 2, 30, { align: 'center' });

            let yPos = 55;

            // 2. Event Title and Basics
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(report.eventName, 15, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Organized by: ${report.clubName || 'N/A'} | Type: ${report.eventType}`, 15, yPos);
            yPos += 15;

            // 3. Info Grid (Table style)
            autoTable(doc, {
                startY: yPos,
                theme: 'grid',
                headStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' },
                bodyStyles: { textColor: [50, 50, 50] },
                columns: [
                    { header: 'Date', dataKey: 'date' },
                    { header: 'Time', dataKey: 'time' },
                    { header: 'Venue', dataKey: 'venue' },
                    { header: 'Participants', dataKey: 'participants' }
                ],
                body: [[
                    new Date(report.date).toLocaleDateString(),
                    report.time,
                    report.venue || 'N/A',
                    report.participants.length.toString()
                ]]
            });

            yPos = (doc as any).lastAutoTable.finalY + 15;

            // 4. Objective & Description
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(67, 56, 202);
            doc.text('OBJECTIVE', 15, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const objectiveLines = doc.splitTextToSize(report.objective || 'N/A', pageWidth - 30);
            doc.text(objectiveLines, 15, yPos);
            yPos += (objectiveLines.length * 5) + 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(67, 56, 202);
            doc.text('DESCRIPTION', 15, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const descLines = doc.splitTextToSize(report.description || 'N/A', pageWidth - 30);
            doc.text(descLines, 15, yPos);
            yPos += (descLines.length * 5) + 15;

            // 5. Winners
            if (report.winners?.length > 0) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(67, 56, 202);
                doc.text('EVENT WINNERS', 15, yPos);
                yPos += 5;

                autoTable(doc, {
                    startY: yPos,
                    theme: 'striped',
                    headStyles: { fillColor: [251, 191, 36], textColor: [0, 0, 0] },
                    body: report.winners.map((name, i) => [
                        i === 0 ? 'Champion (1st)' : i === 1 ? 'Runner Up (2nd)' : 'Second Runner Up (3rd)',
                        name
                    ])
                });
                yPos = (doc as any).lastAutoTable.finalY + 15;
            }

            // 6. Coordinators
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(67, 56, 202);
            doc.text('COORDINATORS', 15, yPos);
            yPos += 5;

            autoTable(doc, {
                startY: yPos,
                theme: 'plain',
                body: [
                    ['Faculty Coordinators:', (report.facultyCoordinators || []).join(', ') || 'N/A'],
                    ['Student Coordinators:', (report.studentCoordinators || []).join(', ') || 'N/A']
                ]
            });
            
            yPos = (doc as any).lastAutoTable.finalY + 20;

            // 7. Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Generated on ${new Date().toLocaleString()} by ${report.createdBy}`, pageWidth / 2, 280, { align: 'center' });
            doc.text('Campus Arena Portal - Automatic System Generation', pageWidth / 2, 285, { align: 'center' });

            const fileName = `${report.eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`;
            doc.save(fileName);
            toast.success('PDF downloaded successfully', { id: toastId });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate PDF. Please try again.', { id: toastId });
        }
    };

    const handlePrint = () => {
        window.print();
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
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/admin/reports')}
                        className="group flex items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold"
                    >
                        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </Button>

                    <div className="flex gap-2">
                        <Button 
                            onClick={handlePrint} 
                            variant="outline" 
                            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 font-semibold"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
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

            {/* Main Report Document - More Concise & Professional */}
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
                <Card className="border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800">
                    <CardContent className="p-0">
                        {/* 1. Header Section - Clean & Official */}
                        <div className="p-10 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/10 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-indigo-600 rounded-lg">
                                            <Shield className="h-5 w-5 text-white" />
                                        </div>
                                        <h2 className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">Official Event Report</h2>
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {report.eventName}
                                    </h1>
                                    <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-indigo-500" /> {report.clubName || 'N/A'}</span>
                                        <span className="flex items-center gap-1.5 font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">TYPE: {report.eventType}</span>
                                    </div>
                                </div>
                                <div className="text-left md:text-right font-mono">
                                    <p className="text-xs font-black text-gray-400 uppercase">Report Number</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">#{report.id.slice(-8).toUpperCase()}</p>
                                    <div className="mt-2 p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl inline-block text-[10px] space-y-0.5">
                                        <p className="text-gray-400 uppercase font-black">Logged: {new Date(report.createdAt).toLocaleDateString()}</p>
                                        <p className="text-indigo-600 font-bold uppercase tracking-tighter">Verified by {report.createdBy}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Concise Meta Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-100 dark:border-gray-700 divide-x divide-gray-100 dark:divide-gray-700">
                            {[
                                { icon: Calendar, label: 'Date', value: new Date(report.date).toLocaleDateString(undefined, { dateStyle: 'medium' }), color: 'text-blue-500' },
                                { icon: Clock, label: 'Time Slot', value: report.time, color: 'text-amber-500' },
                                { icon: MapPin, label: 'Location', value: report.venue || 'TBD', color: 'text-rose-500' },
                                { icon: Users, label: 'Engagement', value: `${report.participants.length} Participants`, color: 'text-emerald-500' }
                            ].map((item, i) => (
                                <div key={i} className="p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <item.icon className={`h-5 w-5 mx-auto mb-2 ${item.color}`} />
                                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 mb-1">{item.label}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* 3. Narrative Sections */}
                        <div className="p-10 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <section className="space-y-4">
                                    <h3 className="text-xs font-black uppercase text-indigo-600 flex items-center gap-2">
                                        <Target className="h-4 w-4" /> Core Objective
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium bg-indigo-50/30 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-50 dark:border-indigo-900/50">
                                        {report.objective}
                                    </p>
                                </section>
                                <section className="space-y-4">
                                    <h3 className="text-xs font-black uppercase text-gray-500 flex items-center gap-2">
                                        <Info className="h-4 w-4" /> Description
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {report.description}
                                    </p>
                                </section>
                            </div>

                            {/* 4. Winners Podium - More Modern */}
                            {report.winners.length > 0 && (
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-amber-500" />
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Merit List / Winners</h3>
                                        <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {report.winners.map((winner, idx) => (
                                            <div 
                                                key={idx} 
                                                className="group relative p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:border-indigo-500 transition-all hover:shadow-lg hover:-translate-y-1"
                                            >
                                                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                                                    idx === 0 ? 'bg-amber-100 text-amber-600' :
                                                    idx === 1 ? 'bg-slate-100 text-slate-600' :
                                                    'bg-orange-100 text-orange-600'
                                                }`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                        {idx === 0 ? 'Champion' : idx === 1 ? '1st Runner Up' : '2nd Runner Up'}
                                                    </p>
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                        {winner}
                                                    </h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* 5. Team Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 dark:border-gray-700 pt-10">
                                {['Faculty', 'Student'].map((role) => {
                                    const coordinators = role === 'Faculty' ? report.facultyCoordinators : report.studentCoordinators;
                                    return (
                                        <div key={role} className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{role} Coordinators</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {coordinators?.length ? coordinators.map((name, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-950/40 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-lg border border-gray-100 dark:border-gray-800">
                                                        <CheckCircle2 className="h-3 w-3 text-indigo-500" /> {name}
                                                    </span>
                                                )) : <span className="text-xs text-gray-400 italic">No {role.toLowerCase()} coordinators listed.</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 6. Footer Content */}
                            <div className="pt-10 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital References</h4>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                                        {report.socialMediaLinks?.length ? report.socialMediaLinks.map((link, idx) => (
                                            <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline underline-offset-4 transition-all">
                                                <ExternalLink className="h-3 w-3" /> External Link {idx + 1}
                                            </a>
                                        )) : <p className="text-xs text-gray-400 italic">No external references found.</p>}
                                    </div>
                                </div>
                                
                                <div className="shrink-0 text-left md:text-right hidden md:block">
                                    <div className="p-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black uppercase text-gray-400">Authenticated By</p>
                                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">CAMPUS ARENA PORTAL</p>
                                        </div>
                                        <div className="p-2 bg-gray-50 dark:bg-gray-950 rounded-lg">
                                            <Shield className="h-5 w-5 text-gray-300 dark:text-gray-700" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <p className="mt-8 text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] no-print">
                    Internal System Report &copy; {new Date().getFullYear()} Campus Arena
                </p>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    .max-w-4xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .Card { border: none !important; shadow: none !important; width: 100% !important; }
                    .CardContent { padding: 0 !important; }
                    .p-10 { padding: 1.5rem !important; }
                    .divide-x > * { border-right: 1px solid #E2E8F0 !important; }
                    .ring-1 { ring: 0 !important; }
                }
                @font-face {
                    font-family: 'Inter';
                    font-weight: 100 900;
                    font-display: swap;
                }
            `}</style>
        </div>
    );
}
