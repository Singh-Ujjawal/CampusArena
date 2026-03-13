'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Plus, Trash2, Image as ImageIcon, X, ChevronLeft,
    Save, Layout, Settings, FileQuestion, BadgeDollarSign,
    Calendar, Clock, Loader2, Trophy
} from 'lucide-react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { DeleteButton } from '@/components/DeleteButton';
import { uploadToCloudinary } from '@/utils/cloudinary';

// IST timezone identifier
const IST_TZ = 'Asia/Kolkata';

/**
 * Convert a UTC ISO string to a datetime-local input value displayed in IST.
 * Uses Intl to format the date correctly in IST, avoiding double-offset bugs.
 */
function toISTInput(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: IST_TZ,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/**
 * Convert a datetime-local input value (IST) to a UTC ISO string.
 * Appends +05:30 explicitly so it's always treated as IST regardless of browser locale.
 */
function fromISTInput(localValue: string): string {
    if (!localValue) return '';
    return new Date(localValue + ':00+05:30').toISOString();
}

interface Question {
    id: string;
    label: string;
    type: 'TEXT' | 'RADIO' | 'CHECKBOX' | 'DROPDOWN' | 'NUMBER' | 'IMAGE_UPLOAD';
    required: boolean;
    options: string[];
}

interface EvaluationCriterion {
    id: string;
    name: string;
    maxMarks: number;
}


export default function AdminCreateRegistrationForm() {
    const { id } = useParams(); // For Edit mode
    const isEdit = !!id;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const linkedEventId = searchParams.get('eventId');
    const linkedContestId = searchParams.get('contestId');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [paymentRequired, setPaymentRequired] = useState(false);
    const [paymentFees, setPaymentFees] = useState('');
    const [clubId, setClubId] = useState(searchParams.get('clubId') || '');
    const [eventId, setEventId] = useState(linkedEventId || '');
    const [contestId, setContestId] = useState(linkedContestId || '');

    // Cloudinary image state
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imagePublicId, setImagePublicId] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriterion[]>([]);
    const [clubs, setClubs] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [contests, setContests] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clubsRes, eventsRes, contestsRes] = await Promise.all([
                    api.get('/api/clubs'),
                    api.get('/api/events'),
                    api.get('/api/contests')
                ]);
                setClubs(clubsRes.data);
                setEvents(eventsRes.data);
                setContests(contestsRes.data);
            } catch (error) {
                toast.error('Failed to load dependency data');
            }
        };

        fetchData();
        if (isEdit) {
            fetchFormData();
        }
    }, [id]);

    const fetchFormData = async () => {
        try {
            const response = await api.get(`/api/registration/forms/${id}`);
            const data = response.data;
            setTitle(data.title);
            setDescription(data.description);
            // Convert UTC ISO → IST datetime-local string (avoids double-offset bug)
            setStartTime(data.startTime ? toISTInput(data.startTime) : '');
            setEndTime(data.endTime ? toISTInput(data.endTime) : '');
            setIsActive(data.active);
            setPaymentRequired(data.paymentRequired || false);
            setPaymentFees(data.paymentFees?.toString() || '');
            setClubId(data.clubId || '');
            setEventId(data.eventId || '');
            setContestId(data.contestId || '');
            setQuestions(data.questions || []);
            setEvaluationCriteria(data.evaluationCriteria || []);
            // Load Cloudinary image if it exists
            if (data.imageUrl) {
                setImageUrl(data.imageUrl);
                setImagePublicId(data.imagePublicId || null);
                setImagePreview(data.imageUrl);
            }
        } catch (error) {
            toast.error('Failed to load form data');
        }
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Math.random().toString(36).substr(2, 9),
            label: '',
            type: 'TEXT',
            required: true,
            options: ['Option 1'],
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (qId: string) => {
        setQuestions(questions.filter((q) => q.id !== qId));
    };

    const updateQuestion = (qId: string, updates: Partial<Question>) => {
        setQuestions(questions.map((q) => (q.id === qId ? { ...q, ...updates } : q)));
    };

    const addCriterion = () => {
        const newCriterion: EvaluationCriterion = {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            maxMarks: 10,
        };
        setEvaluationCriteria([...evaluationCriteria, newCriterion]);
    };

    const removeCriterion = (cId: string) => {
        setEvaluationCriteria(evaluationCriteria.filter((c) => c.id !== cId));
    };

    const updateCriterion = (cId: string, updates: Partial<EvaluationCriterion>) => {
        setEvaluationCriteria(evaluationCriteria.map((c) => (c.id === cId ? { ...c, ...updates } : c)));
    };

    /**
     * Handle image selection and upload to Cloudinary
     */
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            // Upload to Cloudinary
            const result = await uploadToCloudinary(file);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            // Store Cloudinary data
            setImageUrl(result.secure_url);
            setImagePublicId(result.public_id);
            setImagePreview(result.secure_url);
            toast.success('Image uploaded successfully!');
        } catch (error) {
            toast.error('Failed to upload image');
            console.error('Upload error:', error);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (questions.length === 0) {
            toast.error('Please add at least one question');
            return;
        }
        if (paymentRequired && !paymentFees) {
            toast.error('Please enter payment fees');
            return;
        }

        setIsSaving(true);

        // Calculate payment fees, removing if negative or zero
        let finalPaymentFees = null;
        if (paymentRequired && paymentFees) {
            const feeAmount = parseFloat(paymentFees);
            if (feeAmount > 0) {
                finalPaymentFees = feeAmount;
            }
        }

        const formObj: any = {
            title,
            description,
            // Use fromISTInput so the IST datetime-local value is correctly converted to UTC
            startTime: startTime ? fromISTInput(startTime) : null,
            endTime: endTime ? fromISTInput(endTime) : null,
            active: isActive,
            paymentRequired,
            paymentFees: finalPaymentFees,
            clubId: clubId || null,
            eventId: eventId || null,
            contestId: contestId || null,
            questions,
            imageUrl: imageUrl || null,
            imagePublicId: imagePublicId || null,
            evaluationCriteria: evaluationCriteria,
        };


        try {
            if (isEdit) {
                await api.put(`/api/admin/registration/forms/${id}`, formObj);
                toast.success('Form updated successfully!');
            } else {
                await api.post('/api/admin/registration/forms', formObj);
                toast.success('Registration form published!');
            }
            // Navigate back to the originating page
            if (linkedEventId) navigate('/admin/events');
            else if (linkedContestId) navigate('/admin/contests');
            else navigate('/admin/registration');
        } catch (error: any) {
            console.error('Form submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to save form');
        } finally {
            setIsSaving(false);
        }
    };

    const QUESTION_TYPES = [
        { label: 'Short Answer', value: 'TEXT' },
        { label: 'Number', value: 'NUMBER' },
        { label: 'Multiple Choice', value: 'RADIO' },
        { label: 'Checkboxes', value: 'CHECKBOX' },
        { label: 'Dropdown', value: 'DROPDOWN' },
        { label: 'Image Upload', value: 'IMAGE_UPLOAD' },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl h-10 w-10 p-0 hover:bg-white dark:hover:bg-gray-800"
                        onClick={() => navigate('/admin/registration')}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {isEdit ? 'Edit Form' : 'Create New Registration Form'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">Design a dynamic form for club registrations or events</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl h-11 px-6 border-gray-200 dark:border-gray-700" onClick={() => navigate('/admin/registration')}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6 shadow-lg shadow-indigo-200 dark:shadow-none"
                        isLoading={isSaving}
                    >
                        <Save className="h-5 w-5 mr-2" />
                        {isEdit ? 'Update Form' : 'Publish Form'}
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Builder Area */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-none shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-gray-50 dark:border-gray-700/50 p-6 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Layout className="h-5 w-5" />
                                <span className="font-bold uppercase tracking-wider text-xs">Form Structure</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Enter compelling form title..."
                                    className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none dark:text-white"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                <textarea
                                    placeholder="Add a detailed description for participants..."
                                    className="w-full min-h-[100px] bg-transparent border-none focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none text-gray-600 dark:text-gray-300 resize-none h-auto"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Questions Area */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileQuestion className="h-5 w-5 text-indigo-500" />
                                Custom Questions
                            </h3>
                            <span className="text-xs font-medium text-gray-400">{questions.length} Questions Added</span>
                        </div>

                        {questions.map((q) => (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative group"
                            >
                                <Card className="border-2 border-gray-100 dark:border-gray-700/50 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all rounded-2xl overflow-hidden shadow-none">
                                    <CardContent className="p-6 space-y-6">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Question Label (e.g., Why do you want to join?)"
                                                    className="w-full text-lg font-bold bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all dark:text-white"
                                                    value={q.label}
                                                    onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                                                />
                                            </div>
                                            <div className="md:w-56">
                                                <select
                                                    className="w-full h-full bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl border border-transparent focus:border-indigo-500 outline-none transition-all dark:text-white font-medium cursor-pointer"
                                                    value={q.type}
                                                    onChange={(e) => updateQuestion(q.id, { type: e.target.value as any })}
                                                >
                                                    {QUESTION_TYPES.map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Options for multi-choice */}
                                        {['RADIO', 'CHECKBOX', 'DROPDOWN'].includes(q.type) && (
                                            <div className="pl-4 border-l-2 border-indigo-100 dark:border-indigo-900 space-y-3">
                                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest pl-2">Options</p>
                                                {q.options.map((opt, optIdx) => (
                                                    <div key={optIdx} className="flex items-center gap-2 group/opt">
                                                        <div className="h-2 w-2 rounded-full bg-indigo-200 group-hover/opt:bg-indigo-500"></div>
                                                        <input
                                                            type="text"
                                                            className="flex-1 bg-transparent border-b border-gray-200 dark:border-gray-700 py-1 focus:border-indigo-500 outline-none text-sm dark:text-white"
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const newOpts = [...q.options];
                                                                newOpts[optIdx] = e.target.value;
                                                                updateQuestion(q.id, { options: newOpts });
                                                            }}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                                            onClick={() => {
                                                                const newOpts = q.options.filter((_, i) => i !== optIdx);
                                                                updateQuestion(q.id, { options: newOpts });
                                                            }}
                                                            disabled={q.options.length <= 1}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-xs font-bold ml-4"
                                                    onClick={() => updateQuestion(q.id, { options: [...q.options, `Option ${q.options.length + 1}`] })}
                                                >
                                                    <Plus className="h-3 w-3 mr-1" /> Add Option
                                                </Button>
                                            </div>
                                        )}

                                        {q.type === 'IMAGE_UPLOAD' && (
                                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900 flex items-center gap-3">
                                                <ImageIcon className="h-5 w-5 text-blue-500" />
                                                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Participants will be asked to upload an image file.</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-700/50 pt-4">
                                            <label className="flex items-center gap-3 cursor-pointer group/toggle">
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={q.required}
                                                    onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                                                />
                                                <div className={`w-10 h-5 rounded-full transition-all relative ${q.required ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${q.required ? 'left-6' : 'left-1'}`}></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Required Response</span>
                                            </label>

                                            <DeleteButton
                                                onClick={() => removeQuestion(q.id)}
                                                variant="full"
                                                label="Remove Question"
                                                className="h-10 text-xs"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addQuestion}
                            className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 transition-all font-bold"
                        >
                            <Plus className="h-6 w-6 mr-2" />
                            Add Question to Form
                        </Button>
                    </div>

                    {/* Evaluation Criteria Area */}
                    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-indigo-500" />
                                Evaluation Criteria
                            </h3>
                            <span className="text-xs font-medium text-gray-400">{evaluationCriteria.length} Criteria Added</span>
                        </div>

                        {evaluationCriteria.map((c) => (
                            <Card key={c.id} className="border-none shadow-sm bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl overflow-hidden border border-indigo-100/50 dark:border-indigo-900/50">
                                <CardContent className="p-5 flex flex-col md:flex-row items-center gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Criterion Name (e.g., Presentation, Design, Project Utility)"
                                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-gray-400 dark:text-white outline-none"
                                            value={c.name}
                                            onChange={(e) => updateCriterion(c.id, { name: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Max Marks</span>
                                            <input
                                                type="number"
                                                className="w-16 bg-transparent border-none focus:ring-0 text-sm font-bold text-indigo-600 outline-none p-0"
                                                value={c.maxMarks}
                                                onChange={(e) => updateCriterion(c.id, { maxMarks: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <DeleteButton
                                            onClick={() => removeCriterion(c.id)}
                                            title="Remove Criterion"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addCriterion}
                            className="w-full py-6 border-2 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-900/5 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500 transition-all font-bold text-sm"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Evaluation Criterion
                        </Button>
                    </div>

                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                    <Card className="border-none shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-gray-50 dark:border-gray-700/50 p-5 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Settings className="h-5 w-5" />
                                <span className="font-bold uppercase tracking-wider text-xs">Availability & Logic</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Start Participating
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> Closing Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                                {!linkedEventId && !linkedContestId && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Associate with Club</label>
                                            <select
                                                className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                value={clubId}
                                                onChange={(e) => setClubId(e.target.value)}
                                            >
                                                <option value="">None</option>
                                                {clubs.map(club => (
                                                    <option key={club.id} value={club.id}>{club.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Associate with Event (Quiz)</label>
                                            <select
                                                className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                value={eventId}
                                                onChange={(e) => {
                                                    setEventId(e.target.value);
                                                    if (e.target.value) setContestId('');
                                                }}
                                            >
                                                <option value="">None</option>
                                                {events.map(event => (
                                                    <option key={event.id} value={event.id}>{event.title}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Associate with Contest (Coding)</label>
                                            <select
                                                className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                value={contestId}
                                                onChange={(e) => {
                                                    setContestId(e.target.value);
                                                    if (e.target.value) setEventId('');
                                                }}
                                            >
                                                <option value="">None</option>
                                                {contests.map(contest => (
                                                    <option key={contest.id} value={contest.id}>{contest.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Active Status</span>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isActive}
                                        onChange={e => setIsActive(e.target.checked)}
                                    />
                                    <div className={`w-12 h-6 rounded-full relative transition-all ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isActive ? 'left-7' : 'left-1'}`}></div>
                                    </div>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-gray-50 dark:border-gray-700/50 p-5 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <BadgeDollarSign className="h-5 w-5" />
                                <span className="font-bold uppercase tracking-wider text-xs">Monetization & Poster</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <label className="flex items-center justify-between p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl cursor-pointer">
                                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Requires Payment?</span>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={paymentRequired}
                                    onChange={e => setPaymentRequired(e.target.checked)}
                                />
                                <div className={`w-12 h-6 rounded-full relative transition-all ${paymentRequired ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${paymentRequired ? 'left-7' : 'left-1'}`}></div>
                                </div>
                            </label>

                            {paymentRequired && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Entry Fees (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        placeholder="0.00"
                                        value={paymentFees}
                                        onChange={(e) => setPaymentFees(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Poster / QR Attachment</label>
                                <div className="border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-all cursor-pointer relative min-h-[140px] flex flex-col items-center justify-center">
                                    {isUploadingImage && (
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                                            <p className="text-xs text-gray-500">Uploading to Cloudinary...</p>
                                        </div>
                                    )}
                                    {!isUploadingImage && imagePreview ? (
                                        <div className="relative w-full h-full min-h-[100px]">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 shadow-lg"
                                                onClick={(e) => { e.preventDefault(); setImageUrl(null); setImagePublicId(null); setImagePreview(null); }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : !isUploadingImage ? (
                                        <>
                                            <ImageIcon className="h-8 w-8 text-gray-300 mb-2" />
                                            <p className="text-xs text-gray-400 px-4">Upload a banner or payment QR code (Max 2MB, JPG/PNG)</p>
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                                onChange={handleImageChange} 
                                                accept="image/jpeg,image/jpg,image/png"
                                                disabled={isUploadingImage}
                                            />
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
