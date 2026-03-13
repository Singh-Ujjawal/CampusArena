import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, BarChart3, Target, Award, Lightbulb, Users, Code } from 'lucide-react';

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
            icon: Target,
            title: 'MCQ Assessments',
            description: 'Create and conduct MCQ-based tests for various academic events and evaluations.'
        },
        {
            icon: Award,
            title: 'Performance Tracking',
            description: 'Comprehensive participant profiles and historical performance data to measure progress over time.'
        },
        {
            icon: Code,
            title: 'LeetCode Integration',
            description: 'Track your LeetCode problem-solving progress and showcase your coding accomplishments on your profile.'
        },
        {
            icon: Users,
            title: 'Community Engagement',
            description: 'Foster academic collaboration and healthy competition among college students and organizations.'
        },
        {
            icon: Lightbulb,
            title: 'Event Management',
            description: 'Simplified organization and execution of academic contests and assessments.'
        }
    ];

    const goals = [
        {
            title: 'Democratize Competitions',
            description: 'Make quality competitive programming and assessment opportunities accessible to all college students.'
        },
        {
            title: 'Centralize Management',
            description: 'Provide a unified platform for organizing multiple contests and assessments across different organizations.'
        },
        {
            title: 'Enable Growth Tracking',
            description: 'Help students understand their progress and identify areas for improvement through detailed analytics.'
        },
        {
            title: 'Build Community',
            description: 'Create an inclusive environment where students collaborate, compete, and grow together.'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="py-8 md:py-16 text-center bg-gradient-to-b from-indigo-50 dark:from-indigo-900/20 to-transparent rounded-lg px-3 md:px-4">
                <h1 className="text-3xl md:text-6xl font-black text-gray-900 dark:text-gray-100 mb-2 md:mb-4">
                    CampusArena
                </h1>
                <p className="text-sm md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
                    Empowering Students Through Fair Competition and Structured Learning
                </p>
            </div>

            {/* About Section */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-2 md:pb-4">
                        <CardTitle className="text-lg md:text-2xl text-gray-900 dark:text-gray-100">About CampusArena</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 md:space-y-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        <p className="leading-relaxed">
                            CampusArena is a comprehensive platform designed to revolutionize how college students engage with competitive programming and assessments.
                        </p>
                        <p className="leading-relaxed">
                            We provide a centralized, fair, and transparent ecosystem where students can test their skills and track their growth.
                        </p>
                        <p className="leading-relaxed">
                            Built by students, for students, we understand the unique needs of college communities.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-2 md:pb-4">
                        <CardTitle className="text-lg md:text-2xl text-gray-900 dark:text-gray-100">Our Vision</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 md:space-y-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        <p className="leading-relaxed">
                            We envision a future where every college student has access to world-class competitive programming platforms and assessment tools.
                        </p>
                        <p className="leading-relaxed">
                            CampusArena will be the go-to platform for academic competitions, making quality assessment accessible to all.
                        </p>
                        <p className="leading-relaxed">
                            We aspire to build a community of learners who challenge themselves and achieve excellence together.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Goals Section */}
            <div>
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">Our Goals</h2>
                <div className="grid md:grid-cols-2 gap-3 md:gap-6">
                    {goals.map((goal, idx) => (
                        <Card key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900 transition-shadow">
                            <CardContent className="pt-3 md:pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 md:p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
                                        <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-indigo-600 dark:bg-indigo-400 flex items-center justify-center text-white text-xs md:text-sm font-bold">
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 text-sm md:text-base">{goal.title}</h3>
                                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{goal.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Key Features */}
            <div>
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <Card key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900 transition-shadow">
                                <CardContent className="pt-3 md:pt-6">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 md:p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
                                            <Icon className="h-5 w-5 md:h-6 md:w-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-0.5 md:mb-1 text-sm md:text-base">{feature.title}</h3>
                                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Why Choose Us */}
            <Card className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-indigo-50 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2 md:pb-4">
                    <CardTitle className="text-lg md:text-2xl text-gray-900 dark:text-gray-100">Why Choose CampusArena?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-blue-100 dark:border-blue-700">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 md:mb-2 text-sm md:text-base">Fair & Transparent</h4>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Standardized rules and transparent judging for all.</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-blue-100 dark:border-blue-700">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 md:mb-2 text-sm md:text-base">Real-Time Feedback</h4>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Instant results and live leaderboards keep you engaged.</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-blue-100 dark:border-blue-700">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 md:mb-2 text-sm md:text-base">Data-Driven Insights</h4>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Comprehensive analytics to track your growth.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Impact & Values */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2 md:pb-4">
                    <CardTitle className="text-lg md:text-2xl text-gray-900 dark:text-gray-100">Our Core Values</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1 md:space-y-2">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base">Excellence</h4>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">We continuously improve, innovate, and provide the best experience.</p>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base">Integrity</h4>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Fair competition and transparency are our foundation.</p>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base">Community</h4>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">We build supportive communities where learning thrives.</p>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base">Impact</h4>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Every feature creates meaningful impact on student journeys.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Meet the Developers Section */}
            <Card className="bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-blue-50 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2 md:pb-4">
                    <CardTitle className="text-lg md:text-2xl text-gray-900 dark:text-gray-100">Meet Our Developers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        CampusArena is built by a passionate team of full-stack developers and engineers who are committed to creating world-class software. Our developers bring expertise in modern technologies including React, Spring Boot, PostgreSQL, Docker, and more.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-purple-100 dark:border-purple-700">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 md:mb-2 text-sm md:text-base">Full Stack Expertise</h4>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">From frontend UI design with React and Framer Motion to backend APIs with Spring Boot, our team covers the entire stack.</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg border border-purple-100 dark:border-purple-700">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 md:mb-2 text-sm md:text-base">DevOps & Infrastructure</h4>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Scalable cloud infrastructure, containerization with Docker, and CI/CD pipelines ensure reliability and performance.</p>
                        </div>
                    </div>

                    <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-purple-200 dark:border-purple-700">
                        <Link 
                            to="/developers"
                            className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all hover:shadow-lg"
                        >
                            View Full Developer Team
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
