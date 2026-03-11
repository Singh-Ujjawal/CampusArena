import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AdminQuestionsPageSkeleton } from '@/components/skeleton';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { DeleteButton } from '@/components/DeleteButton';

interface Question {
    id?: string;
    questionId?: string; // Backend might return this
    questionText: string;
    options: string[];
    correctOption: number;
    marks: number;
    negativeMarks: number;
}

export default function AdminQuestionsPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

    // Form state
    const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
        options: ['', '', '', ''],
        correctOption: 0,
        marks: 4,
        negativeMarks: 1
    });

    useEffect(() => {
        if (eventId) fetchQuestions();
    }, [eventId]);

    const fetchQuestions = async () => {
        try {
            const response = await api.get(`/api/questions/event/${eventId}`);

            setQuestions(response.data);
        } catch (error) {
            toast.error('Failed to load questions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/api/questions/${id}`);
            toast.success('Question deleted');
            fetchQuestions();
        } catch (error) {
            toast.error('Failed to delete question');
        } finally {
            setQuestionToDelete(null);
        }
    };

    const handleSave = async () => {
        if (!currentQuestion.questionText || !currentQuestion.options?.every(o => o)) {
            toast.error('Please fill all fields');
            return;
        }

        try {
            // Check if we are updating or creating
            // The current backend Update endpoint might be missing from the controller snippet I saw?
            // "QuestionController" had "addQuestion" (POST). Did it have PUT? 
            // Step 534 shows POST /{eventId} and POST /bulk/{eventId}. NO PUT.
            // So we can only create for now. Editing requires deleting and re-creating or adding PUT.
            // Let's assume create only for now to unblock.

            const payload = {
                ...currentQuestion,
                eventId // if needed in body? Controller takes path param.
            };

            await api.post(`/api/questions/${eventId}`, payload);
            toast.success('Question added');

            setIsEditing(false);
            setCurrentQuestion({
                options: ['', '', '', ''],
                correctOption: 0,
                marks: 4,
                negativeMarks: 1
            });
            fetchQuestions();
        } catch (error) {
            toast.error('Failed to save question');
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(currentQuestion.options || [])];
        newOptions[index] = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/events')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Manage Questions</h1>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                )}
            </div>

            {isEditing ? (
                <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle className="text-gray-900 dark:text-gray-100">Add New Question</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Question Text</label>
                            <textarea
                                className="w-full border rounded-md p-2 min-h-[100px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                                value={currentQuestion.questionText || ''}
                                onChange={e => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQuestion.options?.map((opt, idx) => (
                                <div key={idx} className="space-y-1">
                                    <label className="text-sm font-medium flex items-center justify-between text-gray-700 dark:text-gray-200">
                                        Option {idx + 1}
                                        <input
                                            type="radio"
                                            name="correctOption"
                                            checked={currentQuestion.correctOption === idx}
                                            onChange={() => setCurrentQuestion({ ...currentQuestion, correctOption: idx })}
                                            className="h-4 w-4 text-indigo-600"
                                        />
                                    </label>
                                    <Input
                                        value={opt}
                                        onChange={e => handleOptionChange(idx, e.target.value)}
                                        placeholder={`Option ${idx + 1}`}
                                        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="number"
                                label="Marks"
                                value={currentQuestion.marks}
                                onChange={e => setCurrentQuestion({ ...currentQuestion, marks: Number(e.target.value) })}
                                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                            />
                            <Input
                                type="number"
                                label="Negative Marks"
                                step="0.5"
                                value={currentQuestion.negativeMarks}
                                onChange={e => setCurrentQuestion({ ...currentQuestion, negativeMarks: Number(e.target.value) })}
                                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Question</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {isLoading ? <AdminQuestionsPageSkeleton /> : questions.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No questions added yet.</p>
                    ) : (
                        questions.map((q, idx) => (
                            <Card key={q.id || q.questionId || idx}>
                                <CardContent className="flex items-start justify-between p-6">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="font-bold">Q{idx + 1}.</span>
                                            <p className="text-lg">{q.questionText}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2 ml-6">
                                            {q.options.map((opt, i) => (
                                                <div key={i} className={`text-sm ${i === q.correctOption ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {String.fromCharCode(65 + i)}. {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">Avg: {q.marks} / -{q.negativeMarks}</span>
                                        <DeleteButton
                                            onClick={() => setQuestionToDelete(q.id || q.questionId!)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
            <DeleteConfirmDialog
                isOpen={!!questionToDelete}
                onClose={() => setQuestionToDelete(null)}
                onConfirm={() => questionToDelete && handleDelete(questionToDelete)}
                title={questions.find(q => (q.id || q.questionId) === questionToDelete)?.questionText || ''}
                itemType="Question"
            />
        </div>
    );
}
