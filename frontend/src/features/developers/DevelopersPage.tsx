import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Github, Linkedin, Mail, Code2, Rocket, Zap, Users, Terminal, GitBranch, Shield, Cpu, Database, Palette } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const teamMembers = [
    {
        name: 'Ujjawal Singh',
        role: 'Backend Architect',
        bio: 'Architecture & System Design',
        avatar: '/ujjawal.jpeg',
        skills: [ 'Spring Boot', 'MongoDB', 'AWS', 'Microservices', 'System Design',  'Database Design', 'API Development','Containerization', 'CI/CD Pipelines' ],
        email: 'singhujjawal9096@gmail.com',
        linkedin: 'https://www.linkedin.com/in/ujjawal-singh-57463129b/'
    },
    {
        name: 'Prince Kumar',
        role: 'Backend Architect',
        bio: 'Devops & Cloud Infrastructure',
        avatar: '/prince.jpeg',
        skills: [ 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Infrastructure as Code', 'Monitoring & Logging', 'Cloud Security' ],
        email: 'princekumar60090@gmail.com',
        linkedin: 'https://www.linkedin.com/in/prince-kumar-762b9a2a4/'
    },
    {
        name: 'Abhishek Kumar',
        role: 'Frontend Developer',
        bio: 'UI/UX & Frontend Development',
        avatar: '/abhi.jpeg',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion','Gsap', 'Responsive Design', 'Accessibility', 'Performance Optimization' ],
        email: 'abhijaiswal7479@gmamil.com',
        linkedin: 'https://www.linkedin.com/in/abhishek-jais/'
    }
];

const techStack = [
    { name: 'React', icon: Code2, color: 'from-blue-400 to-cyan-500' },
    { name: 'Spring Boot', icon: Cpu, color: 'from-green-400 to-emerald-500' },
    { name: 'MongoDB', icon: Database, color: 'from-green-500 to-emerald-600' },
    { name: 'Docker', icon: Shield, color: 'from-cyan-400 to-blue-500' },
    { name: 'TypeScript', icon: Code2, color: 'from-blue-500 to-indigo-500' },
    { name: 'Tailwind CSS', icon: Palette, color: 'from-cyan-400 to-teal-500' }
];

// const stats = [
//     { label: 'Contributors', value: '10+', icon: Users },
//     { label: 'Code Commits', value: '5k+', icon: GitBranch },
//     { label: 'Lines of Code', value: '100k+', icon: Code2 },
//     { label: 'Uptime', value: '99.9%', icon: Rocket }
// ];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

function StatCounter({ value, label }: { value: string; label: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
        >
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {value}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-widest font-bold mt-2">
                {label}
            </div>
        </motion.div>
    );
}

export default function DevelopersPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse"></div>
                <div className="absolute top-20 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse delay-4000"></div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-2 md:pt-4 pb-4 md:pb-8 px-4 sm:px-6 lg:px-8 min-h-[60vh] flex items-center">
                <div className="max-w-6xl mx-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left Column: Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-left"
                        >
                            <div className="inline-block mb-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl"
                                >
                                    <Terminal className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </motion.div>
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
                                Crafted by <br />
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Quantum Coders
                                </span>
                            </h1>

                            <p className="text-sm md:text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-xl">
                                A talented team of full-stack engineers building the next generation of competitive programming platform with cutting-edge technology.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-5 md:px-7 py-2.5 md:py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg md:rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all text-sm md:text-base"
                                >
                                    View on GitHub
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-5 md:px-7 py-2.5 md:py-3.5 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-bold rounded-lg md:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm md:text-base"
                                >
                                    Join Our Team
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Right Column: Tech Stack */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                {techStack.map((tech, idx) => {
                                    const Icon = tech.icon;
                                    return (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className={`p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gradient-to-br ${tech.color} text-white font-bold text-center shadow-lg group overflow-hidden relative`}
                                        >
                                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                            <Icon className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 relative z-10" />
                                            <span className="text-xs md:text-sm relative z-10 block">{tech.name}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            
                            {/* Decorative background for the tech grid */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 dark:from-blue-500/20 dark:to-purple-600/20 blur-2xl -z-10 rounded-full"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            {/* <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="relative p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden group hover:border-blue-500 dark:hover:border-blue-400 transition-all"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all"></div>
                                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400 mb-4 relative z-10" />
                                    <StatCounter value={stat.value} label={stat.label} />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section> */}


            {/* Team Section */}
            <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12 md:mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">Meet the Team</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">Passionate developers building the future</p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                    >
                        {teamMembers.map((member, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover={{ y: -12 }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity -z-10"></div>
                                <Card className="h-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                                    <div className="h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20"></div>
                                    <CardContent className="pt-0 pb-6 px-6 relative">
                                        <div className="mb-4 text-center -mt-12 mb-6">
                                            <img 
                                                src={member.avatar} 
                                                alt={member.name}
                                                className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto object-contain bg-gray-100 dark:bg-gray-700 p-2 border-4 border-white dark:border-gray-800"
                                            />
                                        </div>
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white text-center">{member.name}</h3>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold text-center mb-1">{member.role}</p>
                                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center mb-4">{member.bio}</p>

                                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                                            {member.skills.map((skill, i) => (
                                                <span key={i} className="px-2 md:px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex gap-3 justify-center pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <motion.a
                                                whileHover={{ scale: 1.2, rotate: 10 }}
                                                href={`mailto:${member.email}`}
                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                                            </motion.a>
                                            <motion.a
                                                whileHover={{ scale: 1.2, rotate: -10 }}
                                                href={member.linkedin}
                                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                            >
                                                <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
                                            </motion.a>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Development Principles */}
            <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12 md:mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">Development Philosophy</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">How we build exceptional software</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {[
                            { icon: Code2, title: 'Clean Code', desc: 'Readable, maintainable, and well-tested code' },
                            { icon: Zap, title: 'Performance First', desc: 'Lightning-fast load times and smooth interactions' },
                            { icon: Shield, title: 'Security Focused', desc: 'Enterprise-grade security and data protection' }
                        ].map((principle, idx) => {
                            const Icon = principle.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all group"
                                >
                                    <motion.div
                                        className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform"
                                        whileHover={{ rotate: 10 }}
                                    >
                                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                                    </motion.div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">{principle.title}</h3>
                                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{principle.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative p-8 md:p-16 rounded-3xl md:rounded-4xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-20">
                            <Code2 className="absolute top-4 right-4 w-24 h-24 md:w-32 md:h-32 text-white opacity-10" />
                            <Terminal className="absolute bottom-4 left-4 w-20 h-20 md:w-28 md:h-28 text-white opacity-10" />
                        </div>

                        <div className="relative z-10 text-center text-white">
                            <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6">Ready to collaborate?</h2>
                            <p className="text-base md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto text-white/90">
                                Join our team of passionate developers. We're always looking for talented engineers to help us build the future of competitive programming.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <motion.a
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    href="mailto:team@campusarena.dev"
                                    className="px-6 md:px-8 py-3 md:py-4 bg-white text-purple-600 font-bold rounded-xl md:rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Mail className="w-5 h-5" />
                                    Get in Touch
                                </motion.a>
                                <motion.a
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    href="mailto:team@campusarena.dev"
                                    className="px-6 md:px-8 py-3 md:py-4 bg-white/20 border-2 border-white text-white font-bold rounded-xl md:rounded-2xl hover:bg-white/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <Mail className="w-5 h-5" />
                                    Email Us
                                </motion.a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
