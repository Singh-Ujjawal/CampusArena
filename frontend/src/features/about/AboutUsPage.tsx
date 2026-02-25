import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, BarChart3, Users, Target, Sparkles } from 'lucide-react';

export default function AboutUsPage() {
    const features = [
        {
            icon: Zap,
            title: 'Competitive Contests',
            description: 'Organize and participate in real-time coding contests with instant judging and live leaderboards.'
        },
        {
            icon: BarChart3,
            title: 'Advanced Analytics',
            description: 'Detailed performance analytics and downloadable reports to track individual growth across events.'
        },
        {
            icon: Users,
            title: 'Role-Based Access',
            description: 'Streamlined management with separate access for administrators and participants.'
        },
        {
            icon: Target,
            title: 'MCQ Assessments',
            description: 'Create and conduct MCQ-based tests for various academic clubs and events.'
        },
        {
            icon: Sparkles,
            title: 'AI-Driven Insights',
            description: 'Future-ready platform with planned AI-driven insights and plagiarism detection.'
        },
        {
            icon: Users,
            title: 'Community Clubs',
            description: 'Support for multiple clubs including Enigma, IEEE, CSI, SDC, and General.'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section - Minimalist */}
            <div className="py-16 text-center">
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-gray-100 mb-4">
                    CampusArena
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
                    A unified competitive and assessment platform designed specifically for college clubs and academic events.
                </p>
            </div>

            {/* Main Description */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">What is CampusArena?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-600 dark:text-gray-400">
                        <p className="leading-relaxed">
                            CampusArena is a comprehensive platform that enables seamless organization of coding contests and MCQ-based tests under various clubs such as Enigma, IEEE, CSI, SDC, and General.
                        </p>
                        <p className="leading-relaxed">
                            The platform provides real-time leaderboards, detailed analytics, downloadable performance reports, and comprehensive participant profiles to track individual growth across events.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Our Vision</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-600 dark:text-gray-400">
                        <p className="leading-relaxed">
                            Our vision is to evolve CampusArena into a full-scale coding and evaluation platform with AI-driven insights, plagiarism detection, and an integrated code execution engine.
                        </p>
                        <p className="leading-relaxed">
                            We aim to centralize event management while promoting structured and competitive learning within the campus ecosystem, making it the go-to platform for all academic competitions and assessments.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Features Grid */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Key Features</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <Card key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900 transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
                                            <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{feature.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Role-Based Access */}
            <Card className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Role-Based Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-blue-700">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                <div className="h-2 w-2 bg-blue-600 rounded-full" />
                                Administrators
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Create and manage contests & assessments</li>
                                <li>• View detailed analytics & reports</li>
                                <li>• Manage participant access</li>
                                <li>• Configure event settings</li>
                            </ul>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-100 dark:border-purple-700">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                <div className="h-2 w-2 bg-purple-600 rounded-full" />
                                Participants
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Participate in contests & assessments</li>
                                <li>• View real-time leaderboards</li>
                                <li>• Track personal performance</li>
                                <li>• Download performance reports</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Supported Clubs */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Supported Clubs & Organizations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {['Enigma', 'IEEE', 'CSI', 'SDC', 'General'].map((club, idx) => (
                            <div key={idx} className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4 text-center">
                                <p className="font-semibold text-indigo-900 dark:text-indigo-300">{club}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Future Roadmap */}
            <Card className="bg-gradient-to-br from-green-50 dark:from-green-900/20 to-emerald-50 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                        Future Roadmap
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-100 dark:border-green-700">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">AI-Driven Insights</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Advanced analytics and personalized recommendations.</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-100 dark:border-green-700">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Plagiarism Detection</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Intelligent code similarity detection and analysis.</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-100 dark:border-green-700">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Code Execution Engine</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Integrated multi-language code execution system.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
