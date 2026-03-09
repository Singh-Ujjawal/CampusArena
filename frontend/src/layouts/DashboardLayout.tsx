import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, LayoutDashboard, PlusCircle, Code2, User, ClipboardList, Menu, X, Info, Trophy } from 'lucide-react';

export default function DashboardLayout() {
    const { isStaff } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ...(isStaff ? [{ name: 'Admin', href: '/admin', icon: PlusCircle }] : []),
        { name: 'Quiz Studio', href: '/events', icon: ClipboardList },
        { name: 'Contest Studio', href: '/contests', icon: Code2 },
        { name: 'LeetCode Arena', href: '/leetcode/questions', icon: Code2 },
        ...(isStaff ? [{ name: 'LC Leaderboard', href: '/leetcode/leaderboard', icon: Trophy }] : []),
        { name: 'About', href: '/about', icon: Info },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors">
            {/* Top Navbar */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 transition-colors">
                <div className="w-full h-20 px-4 sm:px-8 lg:px-12 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 text-xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-tight transition-colors flex-shrink-0 -ml-2">
                        <img src="/main_logo.png" alt="CampusArena Logo" className="h-16 w-auto" />
                        CampusArena
                    </Link>

                    {/* Desktop Nav Links + Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map(link => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={`text-sm font-medium transition-all flex items-center gap-2 ${link.name === 'Profile'
                                        ? `p-2 rounded-full ${isActive(link.href)
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-md'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
                                        } hover:scale-110`
                                        : `${isActive(link.href)
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                                        }`
                                        }`}
                                    title={link.name === 'Profile' ? 'Profile' : ''}
                                >
                                    {link.name === 'Profile' ? (
                                        <Icon className="h-5 w-5" />
                                    ) : (
                                        link.name
                                    )}
                                </Link>
                            );
                        })}

                        {/* Theme toggle icon */}
                        <button
                            onClick={toggleTheme}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {/* IMT Logo */}
                        <img
                            src="/AIMT_PNG.png"
                            alt="IMT Logo"
                            className="h-15 w-auto flex-shrink-0"
                        />
                    </div>

                    {/* Mobile Menu Button + Theme Toggle */}
                    <div className="flex md:hidden items-center gap-2">
                        {/* Theme toggle icon - mobile */}
                        <button
                            onClick={toggleTheme}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {/* IMT Logo - Mobile */}
                        <img
                            src="/AIMT_PNG.png"
                            alt="IMT Logo"
                            className="h-8 w-auto flex-shrink-0"
                        />

                        {/* Hamburger menu */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        <div className="px-4 sm:px-6 mx-auto space-y-1 py-3">
                            {navLinks.map(link => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all hover:scale-105 ${link.name === 'Profile'
                                            ? `${isActive(link.href)
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                            }`
                                            : `${isActive(link.href)
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </nav>

            {/* Page Content */}
            <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
                <div className="mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 mt-12 transition-colors">
                <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            © 2026 <span className="font-semibold text-gray-800 dark:text-gray-200">Quantum Coders</span>. All rights reserved.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            CampusArena
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
