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
    image: string;
    imagePublicId?: string;
    clubCoordinatorId: string;
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
    registeredUserCount?: number;
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
    registrationActivities: RegistrationActivity[];
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
    clubName?: string;
}

export interface ContestActivity {
    contestId: string;
    title: string;
    problemsSolved: number;
    totalProblems: number;
    totalScore: number;
    lastSubmissionTime?: string;
    rank?: number;
    clubName?: string;
}

export interface RegistrationActivity {
    formId: string;
    title: string;
    registeredAt: string;
    status: string;
    evaluationStatus: string;
    score?: number;
    totalMarks?: number;
    clubName?: string;
}

export interface RegistrationForm {
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
    feedbackEnabled?: boolean;
    feedbackQuestions?: any[];
    socialMediaLinks?: { platform: string; url: string; }[];
}

export interface EvaluationCriterion {
    id: string;
    name: string;
    maxMarks: number;
}

export interface EvaluationMark {
    criterionId: string;
    criterionName: string;
    marksObtained: number;
}

export interface RegistrationResponse {
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
    answers: Record<string, any>;
    submittedAt: string;
    status: string;
    evaluationMarks?: EvaluationMark[];
    totalEvaluationMarks?: number;
    maxPossibleMarks?: number;
    evaluationStatus?: 'PENDING' | 'GRADED';
    evaluationFeedback?: string;
    gradedBy?: string;
    gradedAt?: string;
}

export interface Report {
    id: string;
    eventId: string;
    eventType: 'QUIZ' | 'CONTEST' | 'REGISTRATION';
    eventName: string;
    date: string;
    time: string;
    venue?: string;
    facultyCoordinators: string[];
    studentCoordinators: string[];
    clubName?: string;
    objective: string;
    description: string;
    participants: ParticipantInfo[];
    winners: ParticipantInfo[];
    socialMediaLinks: string[];
    createdAt: string;
    createdBy: string;
}

export interface ParticipantInfo {
    name: string;
    rollNumber: string;
    course: string;
    branch: string;
    section: string;
    score: string;
}

export interface ReportRequest {
    eventId: string;
    eventType: 'QUIZ' | 'CONTEST' | 'REGISTRATION';
    venue?: string;
    objective: string;
    socialMediaLinks?: string[];
}

