import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Plus, Trash2, ExternalLink, Loader2, Code2, AlertCircle, Pencil, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface LcQuestion {
    id: string;
    title: string;
    url: string;
    difficulty: string;
    topic: string;
}

const EMPTY_FORM = { title: '', url: '', difficulty: 'Easy', topic: '' };

export default function AdminLeetCodePage() {
    const [questions, setQuestions] = useState<LcQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // null  → add-new mode
    // LcQuestion → edit mode for that question
    const [editingQuestion, setEditingQuestion] = useState<LcQuestion | null>(null);

    const [formData, setFormData] = useState<{ title: string; url: string; difficulty: string; topic: string }>(EMPTY_FORM);

    const fetchQuestions = async () => {
        try {
            const response = await api.get('/admin/leetcode/questions');
            setQuestions(response.data);
        } catch (error) {
            console.error('Failed to fetch questions', error);
            toast.error('Failed to load questions');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ── Open edit panel ─────────────────────────────────────────────────────
    const startEdit = (q: LcQuestion) => {
        setEditingQuestion(q);
        setFormData({ title: q.title, url: q.url, difficulty: q.difficulty, topic: q.topic });
    };

    const cancelEdit = () => {
        setEditingQuestion(null);
        setFormData(EMPTY_FORM);
    };

    // ── Submit: create or update ─────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.url.trim() || !formData.topic.trim()) {
            toast.error('Title, URL and Topic are required.');
            return;
        }
        setIsSubmitting(true);
        try {
            if (editingQuestion) {
                await api.put(`/admin/leetcode/questions/${editingQuestion.id}`, formData);
                toast.success('Question updated successfully!');
            } else {
                await api.post('/admin/leetcode/questions', formData);
                toast.success('Question added successfully!');
            }
            cancelEdit();
            fetchQuestions();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.response?.data || 'Operation failed. The question slug may already exist.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            await api.delete(`/admin/leetcode/questions/${id}`);
            toast.success('Question deleted');
            setQuestions(questions.filter(q => q.id !== id));
            if (editingQuestion?.id === id) cancelEdit();
        } catch {
            toast.error('Failed to delete question');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    const isEditing = editingQuestion !== null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Code2 className="h-8 w-8 text-blue-600" />
                        LeetCode Question Bank
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Manage the questions that users can solve to earn points.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── Side form: Add New / Edit ─────────────────────────── */}
                <div className="lg:col-span-1">
                    <div className={`bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border sticky top-24 transition-colors ${isEditing
                            ? 'border-blue-300 dark:border-blue-600 ring-2 ring-blue-500/20'
                            : 'border-gray-100 dark:border-gray-700'
                        }`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                {isEditing
                                    ? <><Pencil className="h-5 w-5 text-blue-600" /> Edit Question</>
                                    : <><Plus className="h-5 w-5 text-blue-600" /> Add New Question</>
                                }
                            </h2>
                            {isEditing && (
                                <button
                                    onClick={cancelEdit}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="Cancel edit"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {isEditing && (
                            <div className="mb-4 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-xs text-blue-700 dark:text-blue-300 font-medium">
                                Editing: <span className="font-bold">{editingQuestion.title}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Title</label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Two Sum"
                                    className="rounded-xl border-gray-200 dark:border-gray-700"
                                />
                            </div>

                            {/* LeetCode URL */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                    LeetCode URL
                                    <span className="ml-1 text-xs font-normal text-gray-400">(slug is extracted automatically)</span>
                                </label>
                                <Input
                                    name="url"
                                    value={formData.url}
                                    onChange={handleChange}
                                    required
                                    placeholder="https://leetcode.com/problems/two-sum/"
                                    className="rounded-xl border-gray-200 dark:border-gray-700"
                                />
                            </div>

                            {/* Difficulty */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>

                            {/* Topic */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 dark:text-gray-400">Topic</label>
                                <Input
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Arrays, DP, Graph"
                                    className="rounded-xl border-gray-200 dark:border-gray-700"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                {isEditing && (
                                    <Button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="flex-1 rounded-xl py-5 font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`font-bold rounded-xl py-5 shadow-lg transition-all ${isEditing
                                        ? 'flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                        : 'w-full bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                        }`}
                                >
                                    {isSubmitting
                                        ? <Loader2 className="h-5 w-5 animate-spin" />
                                        : isEditing
                                            ? <><Save className="h-4 w-4 inline mr-1" /> Save Changes</>
                                            : 'Add Question'
                                    }
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ── Question list ─────────────────────────────────────── */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Existing Questions</h2>
                            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {questions.length} Total
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Question</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Difficulty</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Topic</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {questions.map((q) => (
                                        <tr
                                            key={q.id}
                                            className={`group transition-colors ${editingQuestion?.id === q.id
                                                ? 'bg-blue-50/50 dark:bg-blue-900/10'
                                                : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{q.title}</span>
                                                    <a
                                                        href={q.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                                                    >
                                                        View on LeetCode <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{q.topic}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => startEdit(q)}
                                                        title="Edit question"
                                                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(q.id)}
                                                        title="Delete question"
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {questions.length === 0 && (
                            <div className="p-20 text-center">
                                <AlertCircle className="h-12 w-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No questions added yet.</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Use the form on the left to add your first question.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
