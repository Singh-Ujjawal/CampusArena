import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Layouts & Pages
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import ClubEventsPage from '@/features/dashboard/ClubEventsPage';

// Events
import EventListPage from '@/features/events/EventListPage';
import EventDetailsPage from '@/features/events/EventDetailsPage';
import TestInterface from '@/features/events/TestInterface';
import TestResultPage from '@/features/events/TestResultPage';

// Contests
import ContestListPage from '@/features/contests/ContestListPage';
import ContestDetailsPage from '@/features/contests/ContestDetailsPage';
import ProblemDetailsPage from '@/features/contests/ProblemDetailsPage';
import LeaderboardPage from '@/features/leaderboard/LeaderboardPage';

// Admin
import AdminDashboard from '@/features/admin/AdminDashboard';
import AdminEventsPage from '@/features/admin/AdminEventsPage';
import AdminContestsPage from '@/features/admin/AdminContestsPage';
import AdminProblemsPage from '@/features/admin/AdminProblemsPage';
import AdminUsersPage from '@/features/admin/AdminUsersPage';
import AdminAnalyticsPage from '@/features/admin/AdminAnalyticsPage';
import AdminQuestionsPage from '@/features/admin/AdminQuestionsPage';
import AdminSubmissionsPage from '@/features/admin/AdminSubmissionsPage';
import AdminContestParticipantsPage from '@/features/admin/AdminContestParticipantsPage';
import AdminEventAnalyticsPage from '@/features/admin/AdminEventAnalyticsPage';
import AdminClubsPage from '@/features/admin/AdminClubsPage';
import AdminFacultyPage from '@/features/admin/AdminFacultyPage';
import AdminCollectiveDetails from '@/features/admin/AdminCollectiveDetails';
import AdminEventLeaderboardPage from '@/features/admin/AdminEventLeaderboardPage';

// Submissions
import MySubmissionsPage from '@/features/submissions/MySubmissionsPage';
import ProfilePage from '@/features/profile/ProfilePage';

// About
import AboutUsPage from '@/features/about/AboutUsPage';

// LeetCode
import LeetCodeLeaderboardPage from '@/features/leetcode/components/LeetCodeLeaderboardPage';
import LeetCodeQuestionsPage from '@/features/leetcode/components/LeetCodeQuestionsPage';
import AdminLeetCodePage from '@/features/admin/AdminLeetCodePage';

// Developers
import DevelopersPage from '@/features/developers/DevelopersPage';

// Registration
import AdminRegistrationHub from '@/features/admin/AdminRegistrationHub';
import AdminCreateRegistrationForm from '@/features/admin/AdminCreateRegistrationForm';
import AdminRegistrationResponses from '@/features/admin/AdminRegistrationResponses';
import RegistrationFormSubmission from '@/features/registration/RegistrationFormSubmission';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/club/:clubId/events" element={<ClubEventsPage />} />

                {/* Event Routes */}
                <Route path="/events" element={<EventListPage />} />
                <Route path="/events/:eventId" element={<EventDetailsPage />} />
                <Route path="/test/:eventId" element={<TestInterface />} />
                <Route path="/test/:eventId/result" element={<TestResultPage />} />

                {/* Contest Routes */}
                <Route path="/contests" element={<ContestListPage />} />
                <Route path="/contests/:contestId" element={<ContestDetailsPage />} />
                <Route path="/contests/:contestId/problem/:problemId" element={<ProblemDetailsPage />} />
                <Route path="/leaderboard/:contestId" element={<LeaderboardPage />} />

                {/* User Routes */}
                <Route path="/submissions" element={<MySubmissionsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/leetcode/questions" element={<LeetCodeQuestionsPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/developers" element={<DevelopersPage />} />
                <Route path="/registration/:id" element={<RegistrationFormSubmission />} />
                <Route path="/registration/forms/:id" element={<RegistrationFormSubmission />} />
              </Route>
            </Route>

            {/* Staff Routes (Admin & Faculty) */}
            <Route element={<ProtectedRoute requireStaff />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/leetcode/leaderboard" element={<LeetCodeLeaderboardPage />} />
                <Route path="/admin/leetcode" element={<AdminLeetCodePage />} />
                
                {/* Moved from Admin only for Faculty access */}
                <Route path="/admin/events" element={<AdminEventsPage />} />
                <Route path="/admin/events/:eventId/questions" element={<AdminQuestionsPage />} />
                <Route path="/admin/events/:eventId/analytics" element={<AdminEventAnalyticsPage />} />
                <Route path="/admin/contests" element={<AdminContestsPage />} />
                <Route path="/admin/contests/:contestId/participants" element={<AdminContestParticipantsPage />} />
                <Route path="/admin/events/:eventId/leaderboard" element={<AdminEventLeaderboardPage />} />
                <Route path="/admin/problems" element={<AdminProblemsPage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/admin/submissions" element={<AdminSubmissionsPage />} />
                <Route path="/admin/registration" element={<AdminRegistrationHub />} />
                <Route path="/admin/registration/create" element={<AdminCreateRegistrationForm />} />
                <Route path="/admin/registration/edit/:id" element={<AdminCreateRegistrationForm />} />
                <Route path="/admin/registration/forms/:id/responses" element={<AdminRegistrationResponses />} />
                <Route path="/admin/collective-details" element={<AdminCollectiveDetails />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/users/:userId" element={<ProfilePage />} />
                <Route path="/admin/faculty" element={<AdminFacultyPage />} />
                <Route path="/admin/clubs" element={<AdminClubsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" richColors duration={3000} visibleToasts={1} />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
