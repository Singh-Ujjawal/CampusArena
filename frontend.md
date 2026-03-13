# CampusArena — Frontend Technical Documentation

> Generated: 2026-03-13 | Based on full source-code analysis of `frontend/src`

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Project Structure](#2-project-structure)
3. [Environment & Configuration](#3-environment--configuration)
4. [Authentication & Authorization Flow](#4-authentication--authorization-flow)
5. [Routing — All Routes](#5-routing--all-routes)
6. [API Endpoints (All Calls)](#6-api-endpoints-all-calls)
7. [Context Providers](#7-context-providers)
8. [TypeScript Data Types](#8-typescript-data-types)
9. [Feature Pages — Detailed Overview](#9-feature-pages--detailed-overview)
10. [Reusable Components & UI Library](#10-reusable-components--ui-library)
11. [State Management Approach](#11-state-management-approach)
12. [Local Storage & Session Storage Keys](#12-local-storage--session-storage-keys)
13. [Theme System (Dark/Light Mode)](#13-theme-system-darklight-mode)
14. [System Flow Diagram](#14-system-flow-diagram)
15. [Key Design Decisions](#15-key-design-decisions)

---

## 1. Technology Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | React | ^19.2.0 |
| **Language** | TypeScript | ~5.9.3 |
| **Build Tool** | Vite | ^7.3.1 |
| **Routing** | React Router DOM | ^7.13.0 |
| **HTTP Client** | Axios | ^1.13.5 |
| **Styling** | Tailwind CSS | ^4.1.18 |
| **Forms** | React Hook Form | ^7.71.1 |
| **Validation** | Zod + @hookform/resolvers | ^4.3.6 / ^5.2.2 |
| **Server State** | TanStack React Query | ^5.90.21 |
| **Code Editor** | Monaco Editor (React) | ^4.7.0 |
| **Animations** | Framer Motion | ^12.34.1 |
| **Charts** | Recharts | ^3.7.0 |
| **Notifications / Toast** | Sonner | ^2.0.7 |
| **Skeleton Loading** | React Loading Skeleton | ^3.5.0 |
| **PDF Generation** | jsPDF + jsPDF-autotable | ^4.2.0 / ^5.0.7 |
| **Icons** | Lucide React | ^0.574.0 |
| **Class Utilities** | clsx + tailwind-merge | ^2.1.1 / ^3.4.1 |

### Dev Dependencies
- `@vitejs/plugin-react` — React fast-refresh HMR
- `eslint` + `typescript-eslint` — Linting
- `autoprefixer` + `postcss` — CSS processing

---

## 2. Project Structure

```
frontend/
├── .env                          # Environment variables
├── index.html                    # Root HTML entry point
├── vite.config.ts                # Vite config (path alias @ → src/)
├── tailwind.config.cjs           # Tailwind configuration
├── tsconfig.app.json             # TypeScript config
├── package.json                  # Dependencies & scripts
└── src/
    ├── main.tsx                  # React root mount, QueryClient provider
    ├── App.tsx                   # Root router + all route definitions + Toaster
    ├── index.css                 # Global base styles
    │
    ├── types/
    │   └── index.ts              # All shared TypeScript interfaces & types
    │
    ├── lib/
    │   ├── axios.ts              # Axios instance + request/response interceptors
    │   └── constants.ts          # CLUBS array and ClubId type
    │
    ├── context/
    │   ├── AuthContext.tsx       # Global auth state (user, login, logout, roles)
    │   └── ThemeContext.tsx      # Dark/light theme (localStorage persistence)
    │
    ├── layouts/
    │   └── DashboardLayout.tsx   # Sticky navbar, footer, <Outlet /> for pages
    │
    ├── components/
    │   ├── ProtectedRoute.tsx    # Route guards (auth, admin, staff)
    │   ├── ArenaCard.tsx         # Reusable event/contest display card
    │   ├── ArenaListPage.tsx     # Generic list page (events & contests shared)
    │   ├── CountdownTimer.tsx    # Live countdown display component
    │   ├── DeleteButton.tsx      # Delete action with confirmation trigger
    │   ├── DeleteConfirmDialog.tsx  # Modal for delete confirmation
    │   ├── skeleton/             # Skeleton screens for loading states
    │   └── ui/                   # Base UI primitives (Button, Input, Card, etc.)
    │
    ├── features/
    │   ├── auth/
    │   │   ├── LoginPage.tsx
    │   │   └── RegisterPage.tsx
    │   ├── dashboard/
    │   │   ├── DashboardPage.tsx
    │   │   └── ClubEventsPage.tsx
    │   ├── events/
    │   │   ├── EventListPage.tsx
    │   │   ├── EventDetailsPage.tsx
    │   │   ├── TestInterface.tsx
    │   │   └── TestResultPage.tsx
    │   ├── contests/
    │   │   ├── ContestListPage.tsx
    │   │   ├── ContestDetailsPage.tsx
    │   │   └── ProblemDetailsPage.tsx
    │   ├── leaderboard/
    │   │   └── LeaderboardPage.tsx
    │   ├── submissions/
    │   │   └── MySubmissionsPage.tsx
    │   ├── profile/
    │   │   └── ProfilePage.tsx
    │   ├── about/
    │   │   └── AboutUsPage.tsx
    │   ├── registration/
    │   │   └── RegistrationFormSubmission.tsx
    │   ├── leetcode/
    │   │   ├── types.ts
    │   │   └── components/
    │   │       ├── LeetCodeLeaderboardPage.tsx
    │   │       ├── LeetCodeQuestionsPage.tsx
    │   │       └── LeetCodeProfile.tsx
    │   └── admin/
    │       ├── AdminDashboard.tsx
    │       ├── AdminEventsPage.tsx
    │       ├── AdminContestsPage.tsx
    │       ├── AdminProblemsPage.tsx
    │       ├── AdminQuestionsPage.tsx
    │       ├── AdminSubmissionsPage.tsx
    │       ├── AdminUsersPage.tsx
    │       ├── AdminFacultyPage.tsx
    │       ├── AdminClubsPage.tsx
    │       ├── AdminAnalyticsPage.tsx
    │       ├── AdminEventAnalyticsPage.tsx
    │       ├── AdminContestParticipantsPage.tsx
    │       ├── AdminLeetCodePage.tsx
    │       ├── AdminCollectiveDetails.tsx
    │       ├── AdminRegistrationHub.tsx
    │       ├── AdminCreateRegistrationForm.tsx
    │       └── AdminRegistrationResponses.tsx
    │
    └── utils/                    # Utility / helper functions
```

---

## 3. Environment & Configuration

**File:** `frontend/.env`

| Variable | Value | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `http://35.154.206.192:8080` | Production AWS backend server |
| `VITE_CLOUDINARY_CLOUD_NAME` | `dixwsvwfk` | Used for club image uploads |

> **Local development fallback:** `http://localhost:8080` (hardcoded fallback in `axios.ts` if env var is absent)

**Vite path alias:** `@` → `src/`  
Example: `import { api } from '@/lib/axios'` resolves to `src/lib/axios.ts`

**Scripts:**
```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript compile + Vite production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

---

## 4. Authentication & Authorization Flow

### Login Process
```
1. User enters credentials on /login
2. POST /api/auth/login  → { username, password }
3. Backend returns        → { token: "eyJ..." }
4. Token saved            → localStorage["auth_token"] = token
5. GET /user/me           → (Bearer token in header)
6. User object saved      → localStorage["auth_user"] = JSON.stringify(user)
7. Navigate               → /dashboard
```

### Axios Interceptors (`src/lib/axios.ts`)

**Request interceptor — runs on every API call:**
- Reads `auth_token` from localStorage → adds `Authorization: Bearer <token>` header
- Reads `auth_user` from localStorage → adds `userId: <id>` header (legacy endpoint support)

**Response interceptor — runs on every API response:**
- On error: extracts message from response body → fires `sonner` toast notification
- Deduplication: same error shown at most once per 5 seconds (using a `Set`)
- On 401: handled at UI level (no forced redirect in interceptor)

### Role System

| Role | Symbol | Access Level |
|---|---|---|
| `USER` | Standard | All regular protected routes |
| `FACULTY` | Staff | Staff routes (Admin panel with limited access) |
| `ADMIN` | Full | All routes including user/club/faculty management |

### ProtectedRoute Guards (`src/components/ProtectedRoute.tsx`)

| Prop | Requirement | Redirects to |
|---|---|---|
| *(none)* | `isAuthenticated` | `/login` if not logged in |
| `requireStaff` | `isAdmin OR isFaculty` | `/login` if not staff |
| `requireAdmin` | `isAdmin` only | `/login` if not admin |

---

## 5. Routing — All Routes

All routes defined in `src/App.tsx`. The app uses `BrowserRouter`.

### 🌐 Public Routes (No Auth Required)

| Path | Component | Description |
|---|---|---|
| `/login` | `LoginPage` | Login form (Username + Password) |
| `/register` | `RegisterPage` | New user registration with full academic details |
| `/*` (fallback) | `Navigate → /login` | Any unknown path goes to login |

---

### 🔒 Protected Routes (Auth Required — all inside `DashboardLayout`)

| Path | Component | Description |
|---|---|---|
| `/` | `Navigate → /dashboard` | Root auto-redirect |
| `/dashboard` | `DashboardPage` | Home: clubs, events, contests grouped by club |
| `/club/:clubId/events` | `ClubEventsPage` | All events/contests for a specific club |
| `/events` | `EventListPage` | Browse all MCQ/Quiz events |
| `/events/:eventId` | `EventDetailsPage` | Event info, registration check, start test |
| `/test/:eventId` | `TestInterface` | Live MCQ test with timer |
| `/test/:eventId/result` | `TestResultPage` | MCQ result (score, rank, answers) |
| `/contests` | `ContestListPage` | Browse all coding contests |
| `/contests/:contestId` | `ContestDetailsPage` | Contest info + problems list |
| `/contests/:contestId/problem/:problemId` | `ProblemDetailsPage` | Code editor + problem statement |
| `/leaderboard/:contestId` | `LeaderboardPage` | Contest final leaderboard |
| `/submissions` | `MySubmissionsPage` | Current user's submission history |
| `/profile` | `ProfilePage` | Own profile (editable) |
| `/profile/:userId` | `ProfilePage` | View another user's profile (read-only) |
| `/leetcode/questions` | `LeetCodeQuestionsPage` | LeetCode question list + user stats |
| `/about` | `AboutUsPage` | About CampusArena page |
| `/registration/:id` | `RegistrationFormSubmission` | Fill & submit a registration form |
| `/registration/forms/:id` | `RegistrationFormSubmission` | Alternative form path |

---

### 👨‍💼 Staff Routes (Admin + Faculty — `requireStaff`)

| Path | Component | Description |
|---|---|---|
| `/admin` | `AdminDashboard` | Admin overview: stats, counts |
| `/leetcode/leaderboard` | `LeetCodeLeaderboardPage` | LeetCode leaderboard (staff only) |
| `/admin/leetcode` | `AdminLeetCodePage` | Manage LeetCode questions |
| `/admin/events` | `AdminEventsPage` | Create / edit / delete MCQ events |
| `/admin/events/:eventId/questions` | `AdminQuestionsPage` | Manage MCQ questions for event |
| `/admin/events/:eventId/analytics` | `AdminEventAnalyticsPage` | Event analytics + PDF download |
| `/admin/contests` | `AdminContestsPage` | Create / edit / delete coding contests |
| `/admin/contests/:contestId/participants` | `AdminContestParticipantsPage` | View contest participants |
| `/admin/problems` | `AdminProblemsPage` | Create / edit / delete coding problems |
| `/admin/analytics` | `AdminAnalyticsPage` | General/cross-event analytics |
| `/admin/submissions` | `AdminSubmissionsPage` | View all user submissions |
| `/admin/registration` | `AdminRegistrationHub` | List and manage all registration forms |
| `/admin/registration/create` | `AdminCreateRegistrationForm` | Create new registration form |
| `/admin/registration/edit/:id` | `AdminCreateRegistrationForm` | Edit existing form |
| `/admin/registration/forms/:id/responses` | `AdminRegistrationResponses` | View & grade responses |
| `/admin/collective-details` | `AdminCollectiveDetails` | Aggregated collective data view |

---

### 🔑 Admin-Only Routes (`requireAdmin`)

| Path | Component | Description |
|---|---|---|
| `/admin/users` | `AdminUsersPage` | Search, view, delete users |
| `/admin/users/:userId` | `ProfilePage` | View/edit any user's profile |
| `/admin/faculty` | `AdminFacultyPage` | Add / delete faculty members |
| `/admin/clubs` | `AdminClubsPage` | Create / edit clubs, upload logos |

---

## 6. API Endpoints (All Calls)

**Base URL:** `http://35.154.206.192:8080` (or `VITE_API_BASE_URL`)

Every request includes:
- `Authorization: Bearer <token>` (from localStorage)
- `userId: <user_id>` (from localStorage, for legacy endpoints)

---

### 🔐 Authentication

| Method | Endpoint | File | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | `AuthContext` | Login → returns `{ token }` |
| `GET` | `/user/me` | `AuthContext`, `ProfilePage` | Get currently logged-in user's full profile |

---

### 👤 Users

| Method | Endpoint | File | Description |
|---|---|---|---|
| `POST` | `/user` | `RegisterPage` | Register new user account |
| `GET` | `/user` | `AdminDashboard`, `AdminUsersPage` | Get all users |
| `GET` | `/user/search?query=<q>` | `AdminUsersPage` | Search users by name/roll/username |
| `GET` | `/user/:userId` | `ProfilePage` | Get specific user by ID |
| `PUT` | `/user/:userId` | `ProfilePage` | Update user profile |
| `DELETE` | `/user/:id` | `AdminUsersPage` | Delete a user |
| `GET` | `/user/activity` | `ProfilePage` | Get current user's activity summary |
| `GET` | `/user/activity/:userId` | `ProfilePage` | Get another user's activity summary |

---

### 🗓️ Events (MCQ / Quiz)

| Method | Endpoint | File | Description |
|---|---|---|---|
| `GET` | `/api/events` | `DashboardPage`, `ClubEventsPage`, `AdminEventsPage`, `AdminAnalyticsPage`, `AdminCreateRegistrationForm` | List all events |
| `GET` | `/api/events/:eventId` | `EventDetailsPage` | Get event details |
| `POST` | `/api/events` | `AdminEventsPage` | Create new event |
| `PUT` | `/api/events/:id` | `AdminEventsPage` | Update event |
| `DELETE` | `/api/events/:id` | `AdminEventsPage` | Delete event |
| `POST` | `/api/events/:eventId/start` | `EventDetailsPage`, `TestInterface` | Validate access password + start event |
| `GET` | `/api/events/:eventId/remaining-time` | `TestInterface` | Get remaining test time for user (params: `userId`) |
| `POST` | `/api/events/:eventId/submit` | `TestInterface` | Submit MCQ answers |
| `GET` | `/api/events/:eventId/result` | `TestResultPage` | Get MCQ result for current user |
| `GET` | `/api/events/:eventId/analytics` | `AdminEventAnalyticsPage` | Detailed analytics for event |
| `GET` | `/api/events/:eventId/analytics/pdf` | `AdminEventAnalyticsPage`, `AdminAnalyticsPage` | Download analytics PDF (blob) |

---

### 🏆 Contests (Coding)

| Method | Endpoint | File | Description |
|---|---|---|---|
| `GET` | `/api/contests` | `DashboardPage`, `ClubEventsPage`, `AdminContestsPage`, `AdminCreateRegistrationForm` | List all contests |
| `GET` | `/api/contests/:contestId` | `ContestDetailsPage`, `ProblemDetailsPage`, `AdminContestParticipantsPage` | Get contest details |
| `POST` | `/api/contests` | `AdminContestsPage` | Create new contest |
| `PUT` | `/api/contests/:id` | `AdminContestsPage` | Update contest |
| `DELETE` | `/api/contests/:id` | `AdminContestsPage` | Delete contest |
| `POST` | `/api/contests/:contestId/validate-password` | `ContestDetailsPage` | Validate contest access password |

---

### 🧩 Problems (Coding Challenges)

| Method | Endpoint | File | Description |
|---|---|---|---|
| `GET` | `/api/problems` | `AdminProblemsPage`, `AdminContestsPage` | List all problems |
| `GET` | `/api/problems/:problemId` | `ProblemDetailsPage`, `ContestDetailsPage` | Get single problem |
| `POST` | `/api/problems` | `AdminProblemsPage` | Create new problem |
| `PUT` | `/api/problems/:id` | `AdminProblemsPage` | Update problem |
| `DELETE` | `/api/problems/:id` | `AdminProblemsPage` | Delete problem |

---

### 📝 Questions (MCQ)

| Method | Endpoint | File | Description |
|---|---|---|---|
| `GET` | `/api/questions/event/:eventId` | `AdminQuestionsPage` | Get all questions for an event |
| `POST` | `/api/questions/:eventId` | `AdminQuestionsPage` | Add question to event |
| `DELETE` | `/api/questions/:id` | `AdminQuestionsPage` | Delete a question |

---

### 📤 Submissions

| Method | Endpoint | File | Description |
|---|---|---|---|
| `GET` | `/api/submissions` | `AdminDashboard`, `AdminSubmissionsPage` | Get all submissions (admin) |
| `GET` | `/api/submissions/user/:userId` | `MySubmissionsPage` | Get submissions by user |
| `GET` | `/api/submissions/contest/:contestId/user/:userId` | `ContestDetailsPage`, `ProblemDetailsPage` | User's submissions for a contest |
| `POST` | `/api/submissions/run` | `ProblemDetailsPage` | Run code (no submission record) |
| `POST` | `/api/submissions` | `ProblemDetailsPage` | Submit code solution for judging |

---

### 📊 Leaderboard

| Method | Endpoint | File | Description |
|---|---|---|---|
| `GET` | `/api/leaderboard/:contestId` | `LeaderboardPage` | Get contest leaderboard (paginated) |

---

### 🏫 Clubs

| Method | Endpoint | File | Description |
|---|---|---|---|
| `GET` | `/api/clubs` | `DashboardPage`, `ClubEventsPage`, `ProfilePage`, `AdminEventsPage`, `AdminContestsPage`, `AdminClubsPage`, `AdminCreateRegistrationForm` | List all clubs |
| `POST` | `/api/clubs` | `AdminClubsPage` | Create new club |
| `PUT` | `/api/clubs/:id` | `AdminClubsPage` | Update club details |

---

### 👨‍🏫 Faculty

| Method | Endpoint | File | Description |
|---|---|---|---|
| `GET` | `/admin/getAllFaculties` | `AdminFacultyPage` | Get all faculty members |
| `POST` | `/admin/insertFaculty` | `AdminFacultyPage` | Add new faculty |
| `DELETE` | `/admin/:id` | `AdminFacultyPage` | Delete faculty by ID |
| `GET` | `/api/faculty` | `AdminClubsPage` | Get faculty (for coordinator assignment dropdown) |

---

### 📋 Registration Forms & Responses

| Method | Endpoint | File | Description |
|---|---|---|---|
| `GET` | `/api/registration/forms` | `DashboardPage`, `ClubEventsPage`, `AdminEventsPage`, `AdminContestsPage`, `AdminRegistrationHub`, `AdminCreateRegistrationForm` | List all registration forms |
| `GET` | `/api/registration/forms/:id` | `RegistrationFormSubmission`, `AdminCreateRegistrationForm`, `AdminRegistrationResponses` | Get form details & fields |
| `GET` | `/api/registration/forms/event/:eventId` | `EventDetailsPage` | Get form linked to a specific event |
| `GET` | `/api/registration/forms/contest/:contestId` | `ContestDetailsPage` | Get form linked to a specific contest |
| `POST` | `/api/admin/registration/forms` | `AdminCreateRegistrationForm` | Create new registration form |
| `PUT` | `/api/admin/registration/forms/:id` | `AdminCreateRegistrationForm` | Update existing form |
| `DELETE` | `/api/admin/registration/forms/:id` | `AdminRegistrationHub` | Delete form |
| `POST` | `/api/registration/forms/:id/submit` | `RegistrationFormSubmission` | Submit form response (student) |
| `GET` | `/api/registration/responses/check` | `EventDetailsPage`, `ContestDetailsPage` | Check if user is registered (params: `eventId/contestId`, `userId`) |
| `GET` | `/api/admin/registration/forms/:id/responses` | `AdminRegistrationHub`, `AdminRegistrationResponses` | Get all responses for a form |
| `PUT` | `/api/admin/registration/responses/:id/status` | `AdminRegistrationResponses` | Approve/Reject a response |
| `PUT` | `/api/registration/responses/:id/marks` | `AdminRegistrationResponses` | Grade a response with evaluation marks |

---

### 🏅 LeetCode

| Method | Endpoint | File | Description |
|---|---|---|---|
| `GET` | `/leetcode/leaderboard` | `LeetCodeLeaderboardPage` | Get full LeetCode leaderboard |
| `GET` | `/leetcode/questions` | `LeetCodeQuestionsPage` | Get LeetCode question list |
| `GET` | `/leetcode/profile/:userId` | `LeetCodeQuestionsPage`, `LeetCodeProfile` | Get LeetCode stats for a user |
| `POST` | `/leetcode/sync/:userId` | `LeetCodeProfile` | Trigger sync of user's LeetCode data from LeetCode API |
| `GET` | `/admin/leetcode/questions` | `AdminLeetCodePage` | Admin: list all LC questions |
| `POST` | `/admin/leetcode/questions` | `AdminLeetCodePage` | Admin: create LC question |
| `PUT` | `/admin/leetcode/questions/:id` | `AdminLeetCodePage` | Admin: update LC question |
| `DELETE` | `/admin/leetcode/questions/:id` | `AdminLeetCodePage` | Admin: delete LC question |

---

### 📁 File Upload

| Method | Endpoint | File | Description |
|---|---|---|---|
| `POST` | `/api/upload` | `AdminClubsPage` | Upload image (multipart/form-data) → returns hosted image URL |

> Used for club logo uploads. Cloudinary cloud name: `dixwsvwfk`

---

## 7. Context Providers

### `AuthContext` — `src/context/AuthContext.tsx`

Wraps the entire application at the root level.

| Property / Method | Type | Description |
|---|---|---|
| `user` | `User \| null` | Currently logged-in user object |
| `isLoading` | `boolean` | Auth initialization loading state |
| `isAuthenticated` | `boolean` | `true` if `user !== null` |
| `isAdmin` | `boolean` | `user.role === 'ADMIN'` |
| `isFaculty` | `boolean` | `user.role === 'FACULTY'` |
| `isStaff` | `boolean` | `isAdmin OR isFaculty` |
| `login(credentials)` | `async (userId, password) => void` | POST login → GET /user/me → stores token + user |
| `logout()` | `() => void` | Clears localStorage, resets user state, shows toast |

**Session Restore on Mount:**  
Reads `auth_token` and `auth_user` from localStorage to restore session without re-login.

---

### `ThemeContext` — `src/context/ThemeContext.tsx`

Wraps the entire application inside `AuthProvider`.

| Property / Method | Type | Description |
|---|---|---|
| `theme` | `'light' \| 'dark'` | Active theme |
| `isDark` | `boolean` | Shorthand for `theme === 'dark'` |
| `toggleTheme()` | `() => void` | Toggles between light and dark |

**On First Load:**  
1. Checks `localStorage["theme"]`  
2. Falls back to `window.matchMedia('prefers-color-scheme: dark')`  
3. Applies `dark` class to `document.documentElement` immediately to prevent FOUC

---

## 8. TypeScript Data Types

All defined in `src/types/index.ts`

### `User`
```ts
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  course: string;            // e.g. 'BTECH', 'BCA', 'MBA'
  branch: string;            // e.g. 'CSE', 'IT', 'AIML'
  rollNumber: string;        // 13-digit roll number
  phoneNumber?: string;
  section?: string;
  session?: string;          // Format: 'YYYY-YY' e.g. '2025-26'
  role: 'ADMIN' | 'FACULTY' | 'USER';
  leetCodeUsername?: string;
}
```

### `Club`
```ts
interface Club {
  id: string;
  name: string;              // e.g. 'ENIGMA', 'CSI', 'IEEE', 'SDC', 'GENERAL'
  image: string;             // URL to club logo
  clubCoordinatorId: string;
}
```

### `Event` (MCQ Quiz)
```ts
interface Event {
  id: string;
  title: string;
  description: string;
  type: string;              // 'MCQ'
  startTime: string;         // ISO datetime
  endTime: string;
  durationInMinutes: number;
  attendanceProcessed: boolean;
  totalMarks: number;
  clubId: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  accessPassword?: string;   // 6-digit password
  facultyCoordinators?: string[];
  studentCoordinators?: string[];
  registrationRequired?: boolean;
}
```

### `Contest` (Coding)
```ts
interface Contest {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  clubId: string;
  problemIds: string[];
  status?: 'UPCOMING' | 'LIVE' | 'ENDED';
  accessPassword?: string;
  facultyCoordinators?: string[];
  studentCoordinators?: string[];
  registrationRequired?: boolean;
}
```

### `Problem`
```ts
interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  testCases?: TestCase[];   // Hidden in student view
}

interface TestCase {
  input: string;
  expectedOutput: string;
  hidden: boolean;
}
```

### `Submission`
```ts
interface Submission {
  id: string;
  userId: string;
  contestId: string;
  problemId: string;
  code: string;
  language: string;
  verdict: string;           // 'ACCEPTED', 'WRONG_ANSWER', etc.
  score: number;
  submittedAt: string;
}
```

### `LeaderboardEntry`
```ts
interface LeaderboardEntry {
  userId: string;
  username: string;
  rollNumber: string;
  totalScore: number;
  problemsSolved: number;
  lastSubmissionTime: string;
}
```

### `Question` (MCQ)
```ts
interface Question {
  questionId?: string;
  questionText: string;
  options: string[];
  marks: number;
  negativeMarks: number;
  // correctOption is hidden from students
}
```

### `McqResult`
```ts
interface McqResult {
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  rank: number;
}
```

### `UserActivity`
```ts
interface UserActivity {
  mcqActivities: McqActivity[];
  contestActivities: ContestActivity[];
  registrationActivities: RegistrationActivity[];
}
```

### `RegistrationForm`
```ts
interface RegistrationForm {
  id: string;
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
  clubId: string;
  eventId?: string;
  contestId?: string;
  active: boolean;
  evaluationCriteria?: EvaluationCriterion[];
}
```

### `RegistrationResponse`
```ts
interface RegistrationResponse {
  id: string;
  formId: string;
  userId: string;
  username: string;
  rollNumber: string;
  name: string;
  email: string;
  phoneNumber: string;
  course: string;
  branch: string;
  section: string;
  answers: Record<string, any>;   // Question ID → Answer
  submittedAt: string;
  status: string;                  // 'PENDING' | 'APPROVED' | 'REJECTED'
  evaluationMarks?: EvaluationMark[];
  totalEvaluationMarks?: number;
  maxPossibleMarks?: number;
  evaluationStatus?: 'PENDING' | 'GRADED';
  evaluationFeedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}
```

### LeetCode Types — `src/features/leetcode/types.ts`
```ts
interface LcUserProfile {
  name: string;
  leetCodeUsername: string;
  totalSolved: number;
  difficultyStats: Record<string, number>;  // { Easy: 50, Medium: 30, Hard: 10 }
  topicStats: Record<string, number>;       // { Array: 20, DP: 15, ... }
  lastSyncTime: string | null;
  lastSyncedTimestamp: number | null;       // epoch ms for cooldown countdown
}

interface LcLeaderboardEntry {
  name: string;
  leetCodeUsername: string;
  totalSolved: number;
  userId: string;
  rollNumber?: string;
  branch?: any;
  course?: any;
  section?: string;
  session?: string;
}
```

---

## 9. Feature Pages — Detailed Overview

### 🏠 DashboardPage (`/dashboard`)
- **API Calls:** `GET /api/events`, `GET /api/contests`, `GET /api/clubs`, `GET /api/registration/forms` (all in parallel)
- **Logic:**
  - Groups events/contests/active-registration-forms by club using a `clubMap`
  - Items without a matching club go to "General Campus Activities" section
  - Filter tabs: `All | MCQ | Coding | Registration`
  - Search across all item titles
  - Admin users see "Go to Admin Panel" button
- **Navigation:** Click on club's "View All" → `/club/:clubId/events`

---

### 📋 ClubEventsPage (`/club/:clubId/events`)
- **API Calls:** `GET /api/events`, `GET /api/contests`, `GET /api/clubs`, `GET /api/registration/forms`
- **Logic:** Identical filtering as Dashboard but scoped to the selected `clubId`

---

### 🔍 EventListPage (`/events`)
- **API Call:** `GET /api/events`
- **Component:** Uses generic `ArenaListPage<Event>` — handles filter tabs (UPCOMING/LIVE/COMPLETED), search, skeleton loading

---

### 📄 EventDetailsPage (`/events/:eventId`)
- **API Calls:**
  - `GET /api/events/:eventId` — load event details
  - `GET /api/registration/responses/check` — check registration status (if `registrationRequired`)
  - `GET /api/registration/forms/event/:eventId` — get form ID (if not registered)
  - `POST /api/events/:eventId/start` — validate 6-digit password
- **Logic:**
  - Status derived client-side from `startTime` / `endTime` → `UPCOMING | LIVE | COMPLETED`
  - If event has `accessPassword`: shows password modal on "Start Test"
  - SessionStorage key `event_access_<eventId>` caches password to avoid re-entry on refresh
  - Registration status shown: `APPROVED` → can start, `PENDING` → waiting message, `REJECTED` → blocked

---

### ⌨️ TestInterface (`/test/:eventId`)
- **API Calls:**
  - `POST /api/events/:eventId/start` — fetch questions
  - `GET /api/events/:eventId/remaining-time` — periodic polling for remaining time
  - `POST /api/events/:eventId/submit` — submit all answers
- **Logic:**
  - MCQ questions displayed one by one or all at once
  - Countdown timer auto-submits when time reaches zero
  - Uses `accessPassword` from query param `?pass=`

---

### 🏁 TestResultPage (`/test/:eventId/result`)
- **API Call:** `GET /api/events/:eventId/result`
- **Shows:** Total score, correct/wrong answers, rank

---

### 🏋️ ContestListPage (`/contests`)
- **API Call:** `GET /api/contests`
- **Component:** Generic `ArenaListPage<Contest>` with filter tabs: `ALL | UPCOMING | LIVE | ENDED`

---

### 🎯 ContestDetailsPage (`/contests/:contestId`)
- **API Calls:**
  - `GET /api/contests/:contestId` — contest info + `problemIds`
  - `GET /api/problems/:id` — fetched for each `problemId` in parallel
  - `GET /api/registration/responses/check` — check registration
  - `GET /api/registration/forms/contest/:contestId` — get form link
  - `GET /api/submissions/contest/:contestId/user/:userId` — user's past submissions
  - `POST /api/contests/:contestId/validate-password` — password check
- **Shows:** Problem list with difficulty, user's solved status per problem

---

### 💻 ProblemDetailsPage (`/contests/:contestId/problem/:problemId`)
- **API Calls:**
  - `GET /api/problems/:problemId` — problem statement + test cases
  - `GET /api/contests/:contestId` — contest time boundaries
  - `GET /api/submissions/contest/:contestId/user/:userId` — past submissions
  - `POST /api/submissions/run` — dry run code
  - `POST /api/submissions` — final submit
- **Editor:** Monaco Editor, supports multiple languages
- **Verdict flow:** Submit → backend judges → verdict returned → colored badge shown

---

### 🏅 LeaderboardPage (`/leaderboard/:contestId`)
- **API Call:** `GET /api/leaderboard/:contestId` (paginated)
- **Features:** Rank table, PDF export via jsPDF + jsPDF-autotable

---

### 📊 MySubmissionsPage (`/submissions`)
- **API Call:** `GET /api/submissions/user/:userId`
- **Shows:** All past submissions with verdict, language, time, score

---

### 👤 ProfilePage (`/profile` or `/profile/:userId`)
- **Dual mode:**
  - **Own profile** (`/profile`): fully editable
  - **Viewed profile** (`/profile/:userId`): read-only (for admin viewing users/faculty)
- **Three tabs:**
  - **Edit Profile** — personal + academic + credentials
  - **Success & History** — MCQ, Contest, Registration activity with stats
  - **LC Statistics** — embeds `LeetCodeProfile` component
- **API Calls:**
  - `GET /user/:userId` — load user data
  - `GET /user/me` — refresh current user after update
  - `GET /user/activity` or `/user/activity/:userId`
  - `GET /api/clubs` — for PDF report club ordering
  - `PUT /user/:id` — save profile changes
- **PDF Report:** jsPDF generates "Student Success Report" — club-wise participation summary table (Quiz, Coding Contest, Evaluation rows)

---

### 📝 RegistrationFormSubmission (`/registration/:id` or `/registration/forms/:id`)
- **API Calls:**
  - `GET /api/registration/forms/:id` — load form schema and custom questions
  - `POST /api/registration/forms/:id/submit` — submit filled form
- **Pre-fills:** User's name, email, roll number, phone, course, branch, section from `AuthContext`

---

### 🎓 LeetCodeQuestionsPage (`/leetcode/questions`)
- **API Calls:**
  - `GET /leetcode/questions` — curated question list
  - `GET /leetcode/profile/:userId` — user's LeetCode progress stats
- **Shows:** Questions tagged by difficulty/topic, user's topic-wise solved count

---

### 🏆 LeetCodeLeaderboardPage (`/leetcode/leaderboard`) *(Staff Only)*
- **API Call:** `GET /leetcode/leaderboard`
- **Features:**
  - Sortable/searchable table (name, LC username, roll number)
  - PDF export
  - Clicking a row → navigates to `/profile/:userId`

---

### 🔧 Admin Pages Summary

| Page | Key Actions | Main API Endpoints |
|---|---|---|
| `AdminDashboard` | Stats overview (counts) | GET events, contests, users, submissions |
| `AdminEventsPage` | CRUD MCQ events | GET/POST/PUT/DELETE `/api/events` |
| `AdminContestsPage` | CRUD contests | GET/POST/PUT/DELETE `/api/contests` |
| `AdminProblemsPage` | CRUD coding problems | GET/POST/PUT/DELETE `/api/problems` |
| `AdminQuestionsPage` | CRUD MCQ questions | GET/POST/DELETE `/api/questions/event/:id` |
| `AdminSubmissionsPage` | View all submissions | GET `/api/submissions` |
| `AdminUsersPage` | Search & delete users | GET/DELETE `/user`, `/user/search` |
| `AdminFacultyPage` | Add/delete faculty | GET/POST/DELETE `/admin/getAllFaculties` |
| `AdminClubsPage` | CRUD clubs + logo upload | GET/POST/PUT `/api/clubs`, POST `/api/upload` |
| `AdminAnalyticsPage` | Event PDF analytics | GET `/api/events/:id/analytics/pdf` |
| `AdminEventAnalyticsPage` | Detailed event analytics | GET `/api/events/:id/analytics` |
| `AdminContestParticipantsPage` | View participants | GET `/api/contests/:id`, submissions |
| `AdminLeetCodePage` | CRUD LeetCode questions | GET/POST/PUT/DELETE `/admin/leetcode/questions` |
| `AdminRegistrationHub` | List/manage forms | GET/DELETE `/api/registration/forms` |
| `AdminCreateRegistrationForm` | Build form with custom fields | GET/POST/PUT `/api/admin/registration/forms` |
| `AdminRegistrationResponses` | View, approve/reject, grade responses | GET responses, PUT status, PUT marks |
| `AdminCollectiveDetails` | Aggregated data view | Various |

---

## 10. Reusable Components & UI Library

### `ArenaListPage<T>` — `src/components/ArenaListPage.tsx`
Generic list page component used by both `EventListPage` and `ContestListPage`. Props:
- `apiUrl` — backend endpoint to fetch items
- `linkPrefix` — base path for item detail links (e.g. `/events` → `/events/:id`)
- `title`, `subtitle`, `description` — header content
- `itemStats(item)` — function returning `{ stat1, stat2 }` for each card
- `Skeleton` — loading skeleton component
- **Filter tabs:** `ALL | UPCOMING | LIVE | COMPLETED/ENDED` (auto-derived from dates)

### `DashboardLayout` — `src/layouts/DashboardLayout.tsx`
Shell layout wrapping all protected pages:
- **Sticky top navbar** (z-index 50): Logo → links → theme toggle → IMT college logo
- **Nav links differ by role:**
  - All users: Dashboard, Quiz Studio, Contest Studio, LeetCode Arena, About, Profile
  - Staff only: + Admin, LC Leaderboard
- **Mobile:** Hamburger menu with full-page drawer
- **Footer:** "© 2026 Quantum Coders. All rights reserved."
- **`<Outlet />`** renders the active page

### `ProtectedRoute` — `src/components/ProtectedRoute.tsx`
Checks `isAuthenticated`, `isAdmin`, `isStaff` from `AuthContext` → redirects to `/login` if failed.

### UI Primitives — `src/components/ui/`
Custom-built (not a library): `Button`, `Input`, `Select`, `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`

### Skeleton Components — `src/components/skeleton/`
Per-page skeleton screens:
- `DashboardSkeleton`
- `EventListPageSkeleton`
- `ContestListPageSkeleton`
- `EventDetailsSkeleton`
- `ContestDetailsSkeleton`

### Other Components
- `ArenaCard` — event/contest card with gradient header by type
- `CountdownTimer` — live countdown with IST timezone
- `DeleteConfirmDialog` — modal that requires confirmation before delete
- `DeleteButton` — pre-styled red delete button

---

## 11. State Management Approach

| Layer | Tool | Where Used |
|---|---|---|
| **Global — Auth** | React Context (`AuthContext`) | User object, login/logout, role flags across app |
| **Global — Theme** | React Context (`ThemeContext`) | Dark/light mode across app |
| **Local — Data Fetching** | `useState` + `useEffect` | All feature pages — fetch on mount, store in state |
| **Local — Forms** | React Hook Form + Zod | Login, Register, ProfilePage, all Admin CRUD forms |
| **Server State** | TanStack React Query | Set up in `main.tsx` via `QueryClientProvider` (available but not adopted uniformly — most pages use manual `useEffect` pattern) |

> **Data flow:** Page mounts → `useEffect` fires → `api.get(...)` → response stored in `useState` → component re-renders with data

---

## 12. Local Storage & Session Storage Keys

### `localStorage`

| Key | Type | Written By | Purpose |
|---|---|---|---|
| `auth_token` | `string` | `AuthContext.login()` | JWT Bearer token for all API calls |
| `auth_user` | `JSON string` | `AuthContext.login()`, `ProfilePage` | Serialized `User` object, restored on page reload |
| `auth_credentials` | `JSON string` | `ProfilePage` | Stores `{ username, password }` for credential renewal (legacy) |
| `theme` | `'light' \| 'dark'` | `ThemeContext` | Persists user's theme preference across sessions |

### `sessionStorage`

| Key | Type | Written By | Purpose |
|---|---|---|---|
| `event_access_<eventId>` | `string` | `EventDetailsPage` | Caches 6-digit event access password for the session, so user doesn't re-enter on page refresh |

---

## 13. Theme System (Dark/Light Mode)

**Detection order on first load:**
1. Check `localStorage["theme"]` (`"light"` or `"dark"`)
2. Check `window.matchMedia('(prefers-color-scheme: dark)')` (system preference)
3. Default to `"light"`

**Application mechanism:**
- Adds/removes `dark` class on `<html>` (`document.documentElement`)
- All Tailwind `dark:` utility classes activate when `dark` class is on `<html>`

**Toggle:** Moon/Sun icon in the navbar top-right corner (both desktop and mobile)

**Persistence:** Every toggle writes to `localStorage["theme"]`

**Flash prevention:** Theme class applied synchronously in `useState` initializer before first render

---

## 14. System Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Browser opens CampusArena                        │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │   App.tsx mounts      │
                        │   AuthProvider        │  ← wraps everything
                        │   ThemeProvider       │  ← wraps everything
                        │   BrowserRouter       │
                        └──────────┬──────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  AuthContext initializes      │
                    │  → read localStorage          │
                    │    auth_token + auth_user     │
                    │  → restore session if found   │
                    └──────────────┬──────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │   ProtectedRoute      │
                        │   isAuthenticated?    │
                        └─────┬──────────┬─────┘
                              │ NO        │ YES
                              ▼           ▼
                         Redirect    Role check
                         to /login   ┌──────────────────┐
                                     │ USER / STAFF / ADMIN │
                                     └──┬────────┬────┬──┘
                                        │        │    │
                                 USER   │      STAFF  │  ADMIN
                                        ▼        ▼    ▼
                                  Protected   Staff   Admin
                                  Routes      Routes  Routes
                                        │
                        ┌───────────────▼──────────────────┐
                        │        DashboardLayout             │
                        │  - Sticky Navbar (role-aware)      │
                        │  - <Outlet /> → active page        │
                        │  - Footer                          │
                        └───────────────┬──────────────────┘

═══════════════════════════════════════════════════════════════
                    GENERAL PAGE DATA FLOW
═══════════════════════════════════════════════════════════════

  Component mounts
    → useEffect fires
    → api.get('/api/...')
    → Axios interceptor adds: Authorization: Bearer <token>
                              userId: <user_id>
    → HTTP request → AWS backend (Spring Boot, port 8080)
    → Response returns JSON
    → useState setter called
    → Component re-renders with data

═══════════════════════════════════════════════════════════════
                       MCQ EVENT FLOW
═══════════════════════════════════════════════════════════════

  /events (EventListPage)
    → GET /api/events → list all events
    → Click event card

  /events/:eventId (EventDetailsPage)
    → GET /api/events/:id → load event
    → If registrationRequired:
        GET /api/registration/responses/check
        If not registered: GET /api/registration/forms/event/:id
          → Link to /registration/forms/:formId
    → If event is LIVE + user is eligible:
        Show "Start Test" button
        → Password modal (6-digit code)
        → POST /api/events/:id/start (validate password)
        → On success: save to sessionStorage["event_access_<id>"]
        → Navigate /test/:id?pass=XXXXXX

  /test/:eventId (TestInterface)
    → POST /api/events/:id/start → returns questions
    → Countdown timer starts
    → Poll GET /api/events/:id/remaining-time
    → User answers MCQs
    → POST /api/events/:id/submit (on finish or timeout)
    → Navigate /test/:id/result

  /test/:eventId/result (TestResultPage)
    → GET /api/events/:id/result
    → Show: score, correct, wrong, rank

═══════════════════════════════════════════════════════════════
                    CODING CONTEST FLOW
═══════════════════════════════════════════════════════════════

  /contests (ContestListPage)
    → GET /api/contests → list all contests

  /contests/:id (ContestDetailsPage)
    → GET /api/contests/:id
    → GET /api/problems/:id (for each problemId in parallel)
    → If password-protected:
        POST /api/contests/:id/validate-password
    → Show problem list → click problem

  /contests/:id/problem/:pid (ProblemDetailsPage)
    → GET /api/problems/:pid → problem statement
    → GET /api/contests/:id → check contest time window
    → Monaco Editor for code input
    → "Run" → POST /api/submissions/run → test output
    → "Submit" → POST /api/submissions → verdict
    → GET /api/submissions/contest/:id/user/:uid → refresh history

  /leaderboard/:contestId (LeaderboardPage)
    → GET /api/leaderboard/:id
    → Shows ranked table with scores

═══════════════════════════════════════════════════════════════
                  REGISTRATION FORM FLOW
═══════════════════════════════════════════════════════════════

  Event requires registration
    → EventDetailsPage: GET /api/registration/responses/check
      → status: null → Show "Register Now" button
      → Link to /registration/forms/:formId

  /registration/forms/:id (RegistrationFormSubmission)
    → GET /api/registration/forms/:id → form schema + custom questions
    → Pre-fill user info from AuthContext
    → User fills custom questions
    → POST /api/registration/forms/:id/submit

  Admin reviews:
    → GET /api/admin/registration/forms/:id/responses
    → PUT /api/admin/registration/responses/:id/status (APPROVED/REJECTED)
    → PUT /api/registration/responses/:id/marks (grading)

  Student sees updated status on EventDetailsPage:
    → APPROVED → can start test
    → PENDING  → "Waiting for approval"
    → REJECTED → blocked

═══════════════════════════════════════════════════════════════
                     PROFILE & LEETCODE FLOW
═══════════════════════════════════════════════════════════════

  /profile (ProfilePage)
    → GET /user/me (own) or GET /user/:id (admin viewing)
    → GET /user/activity (own) or /user/activity/:id
    → Tabs:
        Edit Profile → PUT /user/:id
        Activity History → shows MCQ, contest, registration
        LC Statistics → LeetCodeProfile component
          → GET /leetcode/profile/:userId
          → POST /leetcode/sync/:userId (manual sync trigger)
    → Download PDF → jsPDF report (client-side)

═══════════════════════════════════════════════════════════════
                      ADMIN CRUD FLOW
═══════════════════════════════════════════════════════════════

  Admin navigates to /admin
    → GET events, contests, users, submissions → show counts

  Admin adds Event:
    → POST /api/events → new event created
    Admin adds Questions:
    → POST /api/questions/:eventId → add each MCQ

  Admin manages Clubs:
    → POST /api/upload (multipart) → get image URL
    → POST /api/clubs { name, image, coordinatorId }

  Admin manages Faculty:
    → POST /admin/insertFaculty
    → Faculty can then login with FACULTY role
```

---

## 15. Key Design Decisions

| Decision | Rationale |
|---|---|
| **JWT in localStorage** | Simple SPA pattern; token attached to every request via Axios interceptor. No cookie handling needed. |
| **Three-tier role system** | Fine-grained access: USER (compete), FACULTY (manage events), ADMIN (full control including clubs/users) |
| **Manual `useEffect + useState` for data** | Most pages fetch data this way rather than React Query — keeps each page self-contained |
| **Generic `ArenaListPage<T>` component** | Events and Contests share identical UX for listing — extracted to avoid code duplication |
| **SessionStorage for event passwords** | Caches 6-digit access password per session to avoid re-entry on refresh without persisting across sessions |
| **Sonner toast deduplication** | Axios interceptor prevents spam — same error shows at most once per 5-second window using a `Set` |
| **Client-side PDF generation (jsPDF)** | Profile success reports and analytics downloaded in browser — no backend PDF endpoint needed |
| **Monaco Editor for code submission** | Industry-standard editor with syntax highlighting, intellisense, multi-language support |
| **Tailwind `dark:` class on `<html>`** | Applied via ThemeContext; all components use `dark:` variants for consistent theming |
| **System preference detection** | First visit auto-detects OS dark/light preference using `matchMedia` |
| **Zod + React Hook Form** | Type-safe runtime validation with schema-defined rules; backend field errors mapped to form field errors |
| **Cloudinary for image hosting** | Club logos uploaded via `/api/upload` endpoint — backend handles Cloudinary upload, returns URL |
| **IST Timezone for all dates** | All times displayed in `Asia/Kolkata` using `en-IN` locale — relevant for Indian campus context |
| **`parallel Promise.all` fetches** | Dashboard and other pages fetch multiple resources in parallel to minimize load time |
| **Registration required + approval flow** | Optional per-event registration with admin approval gate before access — enables selective event participation |
| **Clubs as navigation root** | Dashboard organized by club rather than by event type — matches real campus club structure |

---

## 16. Constants

**File:** `src/lib/constants.ts`

```ts
export const CLUBS = [
    { id: 'ENIGMA', name: 'Enigma' },
    { id: 'CSI',    name: 'CSI' },
    { id: 'IEEE',   name: 'IEEE' },
    { id: 'SDC',    name: 'SDC' },
    { id: 'GENERAL', name: 'General' },
];

export type ClubId = typeof CLUBS[number]['id'];
// = 'ENIGMA' | 'CSI' | 'IEEE' | 'SDC' | 'GENERAL'
```

These are the 5 campus clubs, each of which can own events, contests, and registration forms.

---

## 17. Registration Form Fields (Student Registration)

When a student registers via `RegisterPage.tsx`, the following fields are collected and sent to `POST /user`:

| Field | Validation | Notes |
|---|---|---|
| `firstName` | Required | |
| `lastName` | Required | |
| `fatherName` | Required | |
| `email` | Valid email | |
| `username` | Min 3 chars | Used for login |
| `password` | Min 6 chars | |
| `passwordConfirm` | Must match password | Stripped before API call |
| `course` | Enum: `BTECH, BCA, BBA, BCOM, MBA, DIPLOMA` | |
| `branch` | Enum: `CSE, IT, AIML, DS, CIVIL, MECHANICAL, BIOTECH` | Only shown for BTECH/DIPLOMA |
| `rollNumber` | Exactly 13 digits | |
| `phoneNumber` | Exactly 10 digits | |
| `section` | Exactly 1 character | e.g. A, B, C |
| `session` | Format: `YYYY-YY` | e.g. 2025-26, validated via regex |
| `leetCodeUsername` | Optional | |

---

*Documentation covers full source code of `e:\PROJECT\CampusArena\frontend\src`*  
*Last updated: 2026-03-13*
