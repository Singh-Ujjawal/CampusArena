// User
export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fatherName?: string;
    course: string;
    branch: string;
    rollNumber: string;
    phoneNumber?: string;
    section?: string;
    session?: string;
    role: 'ADMIN' | 'FACULTY' | 'USER';
    leetCodeUsername?: string;
}

export interface Club {
    id: string;
    name: string;
    clubCoordinatorName: string;
}

export interface Faculty extends User {
}

// Event (MCQ)
export interface Event {
    id: string;
    title: string;
    description: string;
    type: string; // "MCQ"
    startTime: string;
    endTime: string;
    durationInMinutes: number;
    attendanceProcessed: boolean;
    totalMarks: number;
    clubId: string;
    status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
    accessPassword?: string;
    facultyCoordinators?: string[];
    studentCoordinators?: string[];
    registrationRequired?: boolean;
}

// Contest
export interface Contest {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    clubId: string;
    problemIds: string[];
    status?: 'UPCOMING' | 'LIVE' | 'ENDED'; // Derived or from API
    accessPassword?: string;
    facultyCoordinators?: string[];
    studentCoordinators?: string[];
    registrationRequired?: boolean;
}

// Problem
export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    testCases?: TestCase[]; // Hidden in some views
}

export interface TestCase {
    input: string;
    expectedOutput: string;
    hidden: boolean;
}

// Submission
export interface Submission {
    id: string;
    userId: string;
    contestId: string;
    problemId: string;
    code: string;
    language: string;
    verdict: string; // "ACCEPTED", "WRONG_ANSWER", etc.
    score: number;
    submittedAt: string;
}

// MCQ Types
export interface Question {
    questionId?: string; // or id? Spec says CreateQuestionDTO doesn't have id, but fetching usually does.
    questionText: string;
    options: string[];
    marks: number;
    negativeMarks: number;
    // correctOption is hidden for students
}

export interface McqResult {
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    rank: number;
}

export interface LeaderboardEntry {
    userId: string;
    username: string;
    rollNumber: string;
    totalScore: number;
    problemsSolved: number;
    lastSubmissionTime: string;
}

export interface UserActivity {
    mcqActivities: McqActivity[];
    contestActivities: ContestActivity[];
}

export interface McqActivity {
    eventId: string;
    title: string;
    registeredAt: string;
    submittedAt?: string;
    status: string;
    score?: number;
    totalMarks: number;
    rank?: number;
}

export interface ContestActivity {
    contestId: string;
    title: string;
    problemsSolved: number;
    totalProblems: number;
    totalScore: number;
    lastSubmissionTime?: string;
    rank?: number;
}
