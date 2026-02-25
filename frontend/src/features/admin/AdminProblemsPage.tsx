import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { type Problem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { AdminProblemsPageSkeleton } from '@/components/skeleton';

export default function AdminProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProblem, setCurrentProblem] = useState<Partial<Problem>>({});

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const response = await api.get('/api/problems');
            setProblems(response.data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete usage logic? This is a simple delete call.')) return;
        try {
            await api.delete(`/api/problems/${id}`);
            toast.success('Problem deleted');
            fetchProblems();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                title: currentProblem.title,
                description: currentProblem.description,
                difficulty: currentProblem.difficulty,
                testCases: currentProblem.testCases || []
            };
            // Basic validation
            if (!payload.title || !payload.description || !payload.difficulty) {
                toast.error('Fill required fields'); return;
            }

            if (currentProblem.id) {
                await api.put(`/api/problems/${currentProblem.id}`, payload);
            } else {
                await api.post('/api/problems', payload);
            }
            setIsEditing(false);
            fetchProblems();
        } catch (error) {
            toast.error('Save failed');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (Array.isArray(json)) {
                    setCurrentProblem({ ...currentProblem, testCases: json });
                    toast.success(`Imported ${json.length} test cases`);
                } else {
                    toast.error('JSON must be an array of test cases');
                }
            } catch (err) {
                toast.error('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    if (isLoading && !isEditing) return <AdminProblemsPageSkeleton />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Manage Problems</h1>
                <Button onClick={() => { setCurrentProblem({ testCases: [] }); setIsEditing(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Problem
                </Button>
            </div>

            {isEditing ? (
                <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle className="text-gray-900 dark:text-gray-100">Problem Editor</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Input label="Title" value={currentProblem.title || ''} onChange={e => setCurrentProblem({ ...currentProblem, title: e.target.value })} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700" />
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Description (HTML supported)</label>
                            <textarea
                                className="w-full border rounded-md p-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                                rows={5}
                                value={currentProblem.description || ''}
                                onChange={e => setCurrentProblem({ ...currentProblem, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Difficulty</label>
                            <select
                                className="w-full border rounded-md p-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                                value={currentProblem.difficulty || 'EASY'}
                                onChange={e => setCurrentProblem({ ...currentProblem, difficulty: e.target.value as any })}
                            >
                                <option value="EASY">EASY</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HARD">HARD</option>
                            </select>
                        </div>
                        {/* Test Cases Simplified Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Test Cases (JSON Array)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Button variant="outline" size="sm" type="button">
                                        <Upload className="h-4 w-4 mr-2" /> Import JSON
                                    </Button>
                                </div>
                            </div>
                            <textarea
                                className="w-full border rounded-md p-2 font-mono text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                                rows={5}
                                value={JSON.stringify(currentProblem.testCases || [], null, 2)}
                                onChange={e => {
                                    try {
                                        setCurrentProblem({ ...currentProblem, testCases: JSON.parse(e.target.value) });
                                    } catch (e) { }
                                }}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {problems.map(problem => (
                        <Card key={problem.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{problem.title}</h3>
                                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">{problem.difficulty}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="secondary" className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => { setCurrentProblem(problem); setIsEditing(true); }}><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(problem.id)}><Trash className="h-4 w-4" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
