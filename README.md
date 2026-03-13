# CampusArena — Full Stack Documentation & Developer Guide

> **Stack:** Java 21 · Spring Boot 3.5 · MongoDB · React 19 · TypeScript · Vite  
> **Deployed on:** AWS EC2 — `http://35.154.206.192:8080`  
> **Last Updated:** 2026-03-13

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack — Backend](#2-technology-stack--backend)
3. [Backend Project Structure](#3-backend-project-structure)
4. [Database — MongoDB Collections](#4-database--mongodb-collections)
5. [Security & JWT Authentication](#5-security--jwt-authentication)
6. [All API Endpoints — Complete Reference](#6-all-api-endpoints--complete-reference)
7. [Code Execution Engine (Docker Sandbox)](#7-code-execution-engine-docker-sandbox)
8. [LeetCode Integration](#8-leetcode-integration)
9. [File Upload System](#9-file-upload-system)
10. [PDF Generation (OpenPDF)](#10-pdf-generation-openpdf)
11. [Data Flow — End to End](#11-data-flow--end-to-end)
12. [Role-Based Access Control (RBAC)](#12-role-based-access-control-rbac)
13. [Error Handling](#13-error-handling)
14. [CORS Configuration](#14-cors-configuration)
15. [System Architecture Diagram](#15-system-architecture-diagram)
16. [Running Locally — Setup Guide](#16-running-locally--setup-guide)
17. [Key Business Logic](#17-key-business-logic)

---

## 1. Project Overview

**CampusArena** is a campus-level competitive programming and event management platform for college students. It provides:

- 🏆 **Coding Contests** — with real-time code execution, leaderboards, and multi-language support
- 📝 **MCQ Quiz Events** — timed multiple-choice question events with auto-scoring
- 📋 **Registration Forms** — custom forms for event/contest registration with admin approval workflow
- 🏅 **LeetCode Leaderboard** — syncs users' LeetCode progress and ranks students
- 👤 **User Management** — students, faculty, and admin roles with profile management
- 🏫 **Club System** — all events/contests belong to campus clubs (Enigma, CSI, IEEE, SDC, General)

---

## 2. Technology Stack — Backend

| Category | Technology | Version / Details |
|---|---|---|
| **Language** | Java | 21 (LTS) |
| **Framework** | Spring Boot | 3.5.11 |
| **Web** | Spring Web MVC | REST API, Jackson JSON |
| **Reactive HTTP Client** | Spring WebFlux (WebClient) | Used for LeetCode GraphQL calls |
| **Database** | Spring Data MongoDB | Atlas / Local MongoDB 7.0 |
| **Security** | Spring Security | JWT-based stateless auth |
| **JWT Library** | JJWT (io.jsonwebtoken) | 0.11.5 — HS256 algorithm |
| **Validation** | Spring Validation (Jakarta) | Bean Validation / `@Valid` |
| **Boilerplate Reduction** | Lombok | `@Data`, `@Builder`, `@RequiredArgsConstructor` |
| **API Documentation** | SpringDoc OpenAPI (Swagger UI) | 2.6.0 — available at `/swagger-ui.html` |
| **PDF Generation** | OpenPDF (librepdf) | 2.0.3 — server-side PDF export |
| **Code Execution** | Docker (subprocess) | Isolated sandbox per submission |
| **Build Tool** | Maven | Spring Boot Maven Plugin |
| **Container** | Docker Compose | MongoDB container for local dev |

---

## 3. Backend Project Structure

```
src/main/java/com/campusarena/eventhub/
│
├── EventhubApplication.java            # Spring Boot entry point (@SpringBootApplication)
│
├── config/
│   ├── WebConfig.java                  # CORS + static file serving (/uploads/**)
│   └── FileConfig.java                 # File upload dir configuration
│
├── security/
│   ├── JwtUtils.java                   # JWT generate / validate / parse username
│   ├── JwtAuthFilter.java              # OncePerRequestFilter — reads Bearer token
│   ├── UserDetailsImpl.java            # Spring Security UserDetails wrapper
│   ├── UserDetailsServiceImpl.java     # Loads user by username from MongoDB
│   └── SecurityConfig.java             # SecurityFilterChain, BCrypt, CORS, permit rules
│
├── exception/
│   ├── ResourceNotFoundException.java  # 404-triggering exception
│   ├── ApiException.java               # Generic 400/403 exception
│   └── GlobalExceptionHandler.java     # @ControllerAdvice — maps exceptions to HTTP responses
│
├── user/
│   ├── model/
│   │   ├── User.java                   # MongoDB document (@Document "users")
│   │   ├── Faculty.java                # Faculty document (@Document "faculties")
│   │   ├── Roles.java                  # Enum: USER, FACULTY, ADMIN
│   │   ├── Course.java                 # Enum: BTECH, BCA, BBA, BCOM, MBA, DIPLOMA
│   │   └── Branch.java                 # Enum: CSE, IT, AIML, DS, CIVIL, MECHANICAL, BIOTECH
│   ├── dto/
│   │   ├── UserRequest.java            # Create/update user payload
│   │   ├── UserResponse.java           # User response (password excluded)
│   │   ├── LoginRequest.java           # { username, password }
│   │   ├── JwtResponse.java            # { token, id, username, email, roles }
│   │   ├── FacultyRequest.java         # Faculty create payload
│   │   ├── FacultyResponse.java        # Faculty data response
│   │   ├── UserActivityDTO.java        # Activity aggregation across MCQ/coding/registration
│   │   └── CollectiveActivityDTO.java  # Course/section-level aggregated stats
│   ├── repository/
│   │   ├── UserRepository.java         # findByUsername, findByEmail, findByRollNumber
│   │   └── FacultyRepository.java
│   ├── service/
│   │   ├── UserService.java            # insertUser, updateUser, getUserById, getUserByUsername
│   │   ├── AdminService.java           # getAllUsers, searchUsers, insertFaculty, deleteUserById
│   │   ├── FacultyService.java         # Faculty CRUD
│   │   ├── UserActivityService.java    # Aggregates MCQ + coding + registration activity per user
│   │   └── SecurityService.java        # getCurrentUser(authHeader) — resolves User from JWT
│   └── controller/
│       ├── AuthController.java         # POST /api/auth/login
│       ├── UserController.java         # /user/** CRUD + activity
│       ├── AdminController.java        # /admin/** admin ops
│       └── FacultyController.java      # /api/faculty/**
│
├── club/
│   ├── model/Club.java                 # @Document "clubs" { id, name, image, clubCoordinatorId }
│   ├── repository/ClubRepository.java
│   ├── service/ClubService.java
│   └── controller/ClubController.java  # /api/clubs/**
│
├── event/  (MCQ Quiz Events)
│   ├── model/
│   │   ├── Event.java                  # @Document "events"
│   │   ├── McqQuestion.java            # @Document "mcq_questions" { eventId, options, correctOption, marks, negativeMarks }
│   │   ├── McqSubmission.java          # @Document "mcq_submissions" { userId, eventId, answers, score, startTime }
│   │   ├── EventRegistration.java      # Legacy event registration (non-form)
│   │   └── Answer.java                 # Embedded: { questionId, selectedOption }
│   ├── dto/
│   │   ├── CreateQuestionDTO.java
│   │   ├── QuestionResponseDTO.java    # Questions served to student (NO correctOption)
│   │   ├── SubmitMcqRequestDTO.java    # { answers: [{questionId, selectedOption}] }
│   │   ├── McqResultDTO.java           # { score, correctAnswers, wrongAnswers, rank }
│   │   ├── RemainingTimeResponseDTO.java
│   │   ├── AdminEventAnalyticsDTO.java # Analytics: avg score, top performers, question-wise stats
│   │   └── TopPerformerDTO.java
│   ├── repository/
│   │   ├── EventRepository.java
│   │   ├── McqQuestionRepository.java  # findByEventId
│   │   └── McqSubmissionRepository.java # findByUserIdAndEventId, existsByUserIdAndEventId
│   ├── service/
│   │   ├── EventService.java           # createEvent, startTest, submitTest, getResult, getAnalytics
│   │   ├── EventRegistrationService.java
│   │   └── PdfExportService.java       # generateAnalyticsPdf (OpenPDF)
│   └── controller/
│       ├── EventController.java        # /api/events/**
│       └── QuestionController.java     # /api/questions/**
│
├── contest/  (Coding Contests)
│   ├── model/
│   │   ├── Contest.java                # @Document "contests"
│   │   ├── Problem.java                # @Document "problems" { testCases: [TestCase] }
│   │   ├── TestCase.java               # Embedded: { input, expectedOutput, hidden }
│   │   └── Submission.java             # @Document "submissions" { verdict, score, executionTime... }
│   ├── dto/
│   │   ├── ContestRequest/Response.java
│   │   ├── ProblemRequest/Response.java
│   │   ├── SubmissionRequest/Response.java
│   │   ├── RunRequest/Response.java    # For "Run" (dry-run) requests
│   │   └── LeaderboardEntry.java
│   ├── repository/
│   │   ├── ContestRepository.java
│   │   ├── ProblemRepository.java
│   │   └── SubmissionRepository.java   # findByUserId, findByContestId, findByContestIdAndUserId
│   ├── service/
│   │   ├── ContestService.java         # createContest, validatePassword, FACULTY-scoped ops
│   │   ├── ProblemService.java         # insertProblem, getAllProblems (FACULTY: own only)
│   │   ├── SubmissionService.java      # submitCode, runSampleTests, rate-limit, Docker execution
│   │   └── LeaderboardService.java     # getLeaderboard(contestId) — ranked by score+time
│   └── controller/
│       ├── ContestController.java      # /api/contests/**
│       ├── ProblemController.java      # /api/problems/**
│       ├── SubmissionController.java   # /api/submissions/**
│       └── LeaderboardController.java  # /api/leaderboard/**
│
├── execution/  (Docker Code Runner)
│   ├── model/
│   │   ├── Language.java               # Enum: CPP, JAVA, PYTHON, JAVASCRIPT, C
│   │   └── ExecutionStatus.java        # Enum: ACCEPTED, WRONG_ANSWER, COMPILE_ERROR, TLE, MLE, RUNTIME_ERROR
│   ├── dto/
│   │   ├── ExecutionRequest.java       # { sourceCode, language, testCases, timeLimit }
│   │   ├── ExecutionResponse.java      # { status, executionTime, passedTestCases, stderr, ... }
│   │   └── ExecutionTestCase.java      # { input, expectedOutput }
│   ├── service/
│   │   ├── CodeExecutionService.java   # Core Docker sandbox runner
│   │   └── RateLimitService.java       # In-memory rate limiter (per userId+problemId)
│   └── strategy/
│       ├── LanguageStrategy.java       # Interface: getFileName, getDockerImage, getCompile/RunCommand
│       ├── LanguageStrategyFactory.java # Maps Language enum → strategy
│       ├── CppStrategy.java            # gcc:latest container
│       ├── CStrategy.java              # gcc:latest container
│       ├── JavaStrategy.java           # openjdk:21-slim container
│       ├── PythonStrategy.java         # python:3.11-slim container
│       └── JavascriptStrategy.java     # node:20-slim container
│
├── registration/
│   ├── model/
│   │   ├── RegistrationForm.java       # @Document "registration_forms"
│   │   ├── RegistrationResponse.java   # @Document "registration_responses"
│   │   ├── FormField.java              # Embedded: custom form field definition
│   │   ├── EvaluationCriterion.java    # Embedded: grading rubric
│   │   └── EvaluationMark.java         # Embedded: per-criterion mark
│   ├── repository/
│   │   ├── RegistrationFormRepository.java  # findByEventId, findByContestId
│   │   └── RegistrationResponseRepository.java # findByFormIdAndUserId
│   ├── service/
│   │   ├── RegistrationFormService.java     # CRUD for forms (FACULTY: own only)
│   │   └── RegistrationResponseService.java # submit, checkStatus, approve/reject, grade
│   └── controller/
│       ├── RegistrationController.java      # /api/registration/**
│       └── AdminRegistrationController.java # /api/admin/registration/**
│
├── leetcode/
│   ├── model/
│   │   ├── LcQuestion.java             # @Document "lc_questions" { title, slug, difficulty, topic, url }
│   │   └── LcUserQuestion.java         # @Document "lc_user_questions" { campusUserId, questionId, solvedAt }
│   ├── dto/
│   │   ├── LcQuestionRequest.java
│   │   └── LcUserProfileResponse.java  # { totalSolved, difficultyStats, topicStats, lastSyncTime }
│   ├── repository/
│   │   ├── LcQuestionRepository.java       # findBySlug
│   │   └── LcUserQuestionRepository.java   # findByCampusUserId, countByCampusUserId
│   ├── service/
│   │   ├── LcUserService.java          # syncUser (GraphQL→MongoDB), getUserProfile, getLeaderboard
│   │   ├── LcQuestionService.java      # CRUD for LC questions
│   │   └── LeetCodeService.java        # WebClient → LeetCode GraphQL API
│   └── controller/
│       ├── LcUserController.java       # /leetcode/**
│       └── LcAdminController.java      # /admin/leetcode/questions/**
│
└── upload/
    ├── service/FileUploadService.java  # Saves files to /uploads dir, returns path
    └── controller/FileUploadController.java  # POST /api/upload (multipart)
```

---

## 4. Database — MongoDB Collections

**Database Name:** `mydb` (configured in `docker-compose.yml`)  
**Connection:** `mongodb://localhost:27017` (local) or MongoDB Atlas URI (production)

| Collection | Java Model | Purpose |
|---|---|---|
| `users` | `User` | Student/admin/faculty user accounts |
| `faculties` | `Faculty` | Faculty member records (separate from users) |
| `clubs` | `Club` | Campus clubs (Enigma, CSI, IEEE, SDC, General) |
| `events` | `Event` | MCQ quiz events |
| `mcq_questions` | `McqQuestion` | MCQ questions linked to events |
| `mcq_submissions` | `McqSubmission` | Student MCQ test attempts + scores |
| `contests` | `Contest` | Coding contests |
| `problems` | `Problem` | Coding problems with embedded test cases |
| `submissions` | `Submission` | Code submissions with verdicts |
| `registration_forms` | `RegistrationForm` | Custom registration forms |
| `registration_responses` | `RegistrationResponse` | Student form submissions |
| `lc_questions` | `LcQuestion` | Curated LeetCode question list |
| `lc_user_questions` | `LcUserQuestion` | Per-user solved LC question records |

---

### Collection Schemas

#### `users`
```json
{
  "_id": "ObjectId",
  "username": "unique string",
  "password": "BCrypt hash",
  "email": "unique string",
  "role": "USER | FACULTY | ADMIN",
  "firstName": "string",
  "lastName": "string",
  "fatherName": "string",
  "course": "BTECH | BCA | BBA | BCOM | MBA | DIPLOMA",
  "branch": "CSE | IT | AIML | DS | CIVIL | MECHANICAL | BIOTECH",
  "rollNumber": "unique 13-digit string",
  "phoneNumber": "unique 10-digit string",
  "section": "string (A/B/C)",
  "session": "YYYY-YY",
  "leetCodeUsername": "unique string (nullable)",
  "lastSyncedTimestamp": "epoch millis",
  "lastSyncTime": "ISO LocalDateTime"
}
```
> **Unique Indexes:** `username`, `email`, `rollNumber`, `phoneNumber`, `leetCodeUsername`

#### `events`
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "type": "MCQ | CODING | SEMINAR",
  "startTime": "ISODate",
  "endTime": "ISODate",
  "durationInMinutes": "integer",
  "attendanceProcessed": "boolean",
  "totalMarks": "double",
  "clubId": "Club ObjectId ref",
  "status": "UPCOMING | LIVE | COMPLETED",
  "accessPassword": "6-digit string",
  "facultyCoordinators": ["string"],
  "studentCoordinators": ["string"],
  "registrationRequired": "boolean",
  "createdBy": "username string"
}
```

#### `contests`
```json
{
  "_id": "ObjectId",
  "title": "string",
  "startTime": "ISODate (Instant)",
  "endTime": "ISODate (Instant)",
  "clubId": "Club ObjectId ref",
  "accessPassword": "6-digit string",
  "problemIds": ["Problem ObjectId ref"],
  "facultyCoordinators": ["string"],
  "studentCoordinators": ["string"],
  "registrationRequired": "boolean",
  "createdBy": "username string"
}
```

#### `problems`
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string (markdown supported)",
  "difficulty": "EASY | MEDIUM | HARD",
  "createdBy": "username string",
  "testCases": [
    { "input": "string", "expectedOutput": "string", "hidden": "boolean" }
  ]
}
```

#### `submissions`
```json
{
  "_id": "ObjectId",
  "userId": "User ObjectId ref",
  "contestId": "Contest ObjectId ref",
  "problemId": "Problem ObjectId ref",
  "code": "string",
  "language": "CPP | JAVA | PYTHON | JAVASCRIPT | C",
  "verdict": "PENDING | ACCEPTED | WRONG_ANSWER | COMPILE_ERROR | TIME_LIMIT_EXCEEDED | MEMORY_LIMIT_EXCEEDED | RUNTIME_ERROR",
  "score": "integer (100 if ACCEPTED, else 0)",
  "submittedAt": "ISODate (Instant)",
  "executionTime": "long (ms)",
  "passedTestCases": "integer",
  "totalTestCases": "integer",
  "failedTestCase": "integer (1-indexed)",
  "compileError": "string",
  "stderr": "string"
}
```

#### `mcq_questions`
```json
{
  "_id": "ObjectId",
  "eventId": "Event ObjectId ref",
  "questionText": "string",
  "options": ["string", "string", "string", "string"],
  "correctOption": "integer (0-indexed)",
  "marks": "double",
  "negativeMarks": "double (default 0)"
}
```

#### `mcq_submissions`
```json
{
  "_id": "ObjectId",
  "userId": "User ObjectId ref",
  "eventId": "Event ObjectId ref",
  "answers": [{ "questionId": "string", "selectedOption": "integer" }],
  "score": "double",
  "startTime": "ISODate",
  "submittedAt": "ISODate"
}
```

#### `registration_forms`
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "clubId": "Club ObjectId ref",
  "eventId": "Event ref (nullable)",
  "contestId": "Contest ref (nullable)",
  "active": "boolean",
  "startTime": "ISODate (nullable)",
  "endTime": "ISODate (nullable)",
  "fields": [
    { "id": "string", "label": "string", "type": "text|textarea|select|file", "required": "boolean", "options": ["string"] }
  ],
  "evaluationCriteria": [
    { "id": "string", "name": "string", "maxMarks": "double" }
  ],
  "createdBy": "username string"
}
```

#### `registration_responses`
```json
{
  "_id": "ObjectId",
  "formId": "RegistrationForm ObjectId ref",
  "userId": "User ObjectId ref",
  "name": "string",
  "email": "string",
  "rollNumber": "string",
  "phoneNumber": "string",
  "course": "string",
  "branch": "string",
  "section": "string",
  "answers": { "fieldId": "answer value" },
  "submittedAt": "ISODate",
  "status": "PENDING | APPROVED | REJECTED",
  "evaluationMarks": [{ "criterionId": "string", "criterionName": "string", "marksObtained": "double" }],
  "totalEvaluationMarks": "double",
  "maxPossibleMarks": "double",
  "evaluationStatus": "PENDING | GRADED",
  "evaluationFeedback": "string",
  "gradedBy": "string",
  "gradedAt": "ISODate"
}
```

#### `lc_questions`
```json
{
  "_id": "ObjectId",
  "title": "string",
  "slug": "unique string (LeetCode slug)",
  "difficulty": "Easy | Medium | Hard",
  "topic": "string (e.g. Array, DP, Graph)",
  "url": "string (LeetCode URL)"
}
```

---

## 5. Security & JWT Authentication

### Security Configuration (`SecurityConfig.java`)

**Public (permit all — no token required):**
```
POST  /api/auth/login
POST  /user              (registration)
GET   /api/clubs/**
GET   /api/events/**
GET   /api/contests/**
GET   /api/problems/**
GET   /api/questions/**
GET   /leetcode/**
GET   /uploads/**        (static file serving)
GET   /swagger-ui/**
GET   /v3/api-docs/**
```

**Authenticated (all others require valid JWT Bearer token)**

### JWT Flow

```
1. Client → POST /api/auth/login { username, password }
2. Spring Security AuthenticationManager authenticates via BCrypt
3. On success: generate JWT
   - Subject: username
   - IssuedAt: now
   - Expiration: now + jwtExpirationMs (from application.properties)
   - Signed with: HMAC-SHA256 using secret from ${app.jwtSecret}
4. Return: { token, id, username, email, roles[] }

5. Client stores token in localStorage["auth_token"]

6. Every subsequent request:
   Client → Authorization: Bearer <token>
   ↓
   JwtAuthFilter.doFilterInternal():
     - Extracts "Bearer " prefix
     - Validates JWT signature + expiry
     - Extracts username from claims
     - Loads UserDetails from MongoDB
     - Sets Authentication in SecurityContext

7. Controller accesses Principal via:
   java.security.Principal principal  → principal.getName() = username
   SecurityService.getCurrentUser(auth) → resolves full User entity
```

### Password Encoding
- BCryptPasswordEncoder (strength 10) — configured in `SecurityConfig`
- Passwords hashed on user creation/faculty creation
- Never returned in any response DTO

---

## 6. All API Endpoints — Complete Reference

**Server:** `http://35.154.206.192:8080`  
**SwaggerUI:** `http://35.154.206.192:8080/swagger-ui.html`

---

### 🔐 Authentication — `/api/auth`

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ Public | `{ username, password }` | `{ token, id, username, email, roles[] }` |

---

### 👤 Users — `/user`

| Method | Path | Auth | Body / Params | Response |
|---|---|---|---|---|
| `POST` | `/user` | ❌ Public | `UserRequest` body | `UserResponse` (201) |
| `GET` | `/user` | ✅ Required | — | `List<UserResponse>` |
| `GET` | `/user/me` | ✅ Required | — (reads JWT Principal) | `UserResponse` |
| `GET` | `/user/{userid}` | ✅ Required | — | `UserResponse` |
| `PUT` | `/user/{userid}` | ✅ Required | `UserRequest` body | `UserResponse` |
| `DELETE` | `/user/{id}` | ✅ Required | — | `204 No Content` |
| `GET` | `/user/search` | ✅ Required | `?query=string` | `List<UserResponse>` |
| `GET` | `/user/activity` | ✅ Required | — (reads JWT Principal) | `UserActivityDTO` |
| `GET` | `/user/activity/{userId}` | ✅ Required | — | `UserActivityDTO` |
| `GET` | `/user/collective-activity` | ✅ Required | `?course=&session=&section=` | `CollectiveActivityDTO` |

**`UserRequest` fields:** `username, password, email, firstName, lastName, fatherName, course, branch, rollNumber, phoneNumber, section, session, leetCodeUsername`

---

### 🔧 Admin (Legacy) — `/admin`

| Method | Path | Auth | Body / Params | Response |
|---|---|---|---|---|
| `GET` | `/admin/getAllUsers` | ✅ Required | — | `List<UserResponse>` |
| `GET` | `/admin/getAllFaculties` | ✅ Required | — | `List<FacultyResponse>` |
| `POST` | `/admin/insertFaculty` | ✅ Required | `FacultyRequest` body | `FacultyResponse` (201) |
| `GET` | `/admin/getUserById/{userId}` | ✅ Required | — | `UserResponse` |
| `GET` | `/admin/getFacultyById/{facultyId}` | ✅ Required | — | `FacultyResponse` |
| `DELETE` | `/admin/{id}` | ✅ Required | — | `204 No Content` |

---

### 👨‍🏫 Faculty — `/api/faculty`

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/faculty` | ✅ Required | — | `List<FacultyResponse>` |
| `GET` | `/api/faculty/{facultyId}` | ✅ Required | — | `FacultyResponse` |
| `PUT` | `/api/faculty/{facultyId}` | ✅ Required | `FacultyRequest` body | `FacultyResponse` |

---

### 🏫 Clubs — `/api/clubs`

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/clubs` | ❌ Public | — | `List<Club>` |
| `GET` | `/api/clubs/{id}` | ❌ Public | — | `Club` |
| `POST` | `/api/clubs` | ✅ Required | `Club` body | `Club` (201) |
| `PUT` | `/api/clubs/{id}` | ✅ Required | `Club` body | `Club` |
| `DELETE` | `/api/clubs/{id}` | ✅ Required | — | `204 No Content` |

---

### 🗓️ Events (MCQ) — `/api/events`

| Method | Path | Auth | Body / Params | Response |
|---|---|---|---|---|
| `GET` | `/api/events` | ❌ Public | — | `List<Event>` (FACULTY: own events only) |
| `GET` | `/api/events/{id}` | ❌ Public | — | `Event` |
| `POST` | `/api/events` | ✅ Required | `Event` body | `Event` |
| `PUT` | `/api/events/{id}` | ✅ Required | `Event` body | `Event` |
| `DELETE` | `/api/events/{id}` | ✅ Required | — | `204` (FACULTY: own only) |
| `POST` | `/api/events/{id}/start` | ✅ Required | `?userId=&accessPassword=` | `List<QuestionResponseDTO>` |
| `POST` | `/api/events/{id}/submit` | ✅ Required | `?userId=` + `SubmitMcqRequestDTO` | `McqResultDTO` |
| `GET` | `/api/events/{id}/result` | ✅ Required | `?userId=` | `McqResultDTO` |
| `GET` | `/api/events/{id}/remaining-time` | ✅ Required | `?userId=` | `RemainingTimeResponseDTO` |
| `GET` | `/api/events/{id}/analytics` | ✅ Required | — | `AdminEventAnalyticsDTO` |
| `GET` | `/api/events/{id}/analytics/pdf` | ✅ Required | — | `byte[]` (PDF attachment) |
| `POST` | `/api/events/{id}/register` | ✅ Required | `?userId=` | `String` |
| `POST` | `/api/events/{id}/cancel` | ✅ Required | `?userId=` | `String` |

**`SubmitMcqRequestDTO`:** `{ answers: [{ questionId, selectedOption }] }`  
**`McqResultDTO`:** `{ score, correctAnswers, wrongAnswers, rank }`  
**`QuestionResponseDTO`:** Questions **without** `correctOption` (safe for student view)

---

### 📝 MCQ Questions — `/api/questions`

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/questions/event/{eventId}` | ❌ Public | — | `List<McqQuestion>` |
| `POST` | `/api/questions/{eventId}` | ✅ Required | `CreateQuestionDTO` | `McqQuestion` |
| `POST` | `/api/questions/bulk/{eventId}` | ✅ Required | `List<CreateQuestionDTO>` | `List<McqQuestion>` |
| `DELETE` | `/api/questions/{id}` | ✅ Required | — | `204` |

**`CreateQuestionDTO`:** `{ questionText, options[], correctOption, marks, negativeMarks }`

---

### 🏆 Contests (Coding) — `/api/contests`

| Method | Path | Auth | Body / Params | Response |
|---|---|---|---|---|
| `GET` | `/api/contests` | ❌ Public | — | `List<ContestResponse>` (FACULTY: own only) |
| `GET` | `/api/contests/{id}` | ❌ Public | — | `ContestResponse` |
| `POST` | `/api/contests` | ✅ Required | `ContestRequest` body | `ContestResponse` |
| `PUT` | `/api/contests/{id}` | ✅ Required | `ContestRequest` body | `ContestResponse` |
| `DELETE` | `/api/contests/{id}` | ✅ Required | — | `204` (FACULTY: own only) |
| `POST` | `/api/contests/{id}/validate-password` | ✅ Required | `?password=&userId=` | `Boolean` |

---

### 🧩 Problems — `/api/problems`

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/api/problems` | ❌ Public | — | `List<ProblemResponse>` (FACULTY: own only) |
| `GET` | `/api/problems/{id}` | ❌ Public | — | `ProblemResponse` |
| `POST` | `/api/problems` | ✅ Required | `ProblemRequest` body | `ProblemResponse` |
| `PUT` | `/api/problems/{id}` | ✅ Required | `ProblemRequest` body | `ProblemResponse` |
| `DELETE` | `/api/problems/{id}` | ✅ Required | — | `204` |

**`ProblemRequest`:** `{ title, description, difficulty, testCases: [{ input, expectedOutput, hidden }] }`  
> Hidden test cases are **not** returned in `GET /api/problems/{id}` for students.

---

### 📤 Submissions — `/api/submissions`

| Method | Path | Auth | Body / Params | Response |
|---|---|---|---|---|
| `GET` | `/api/submissions` | ✅ Required | — | `List<SubmissionResponse>` (FACULTY: own contests only) |
| `POST` | `/api/submissions` | ✅ Required | `SubmissionRequest` body | `SubmissionResponse` |
| `POST` | `/api/submissions/run` | ✅ Required | `RunRequest` body | `RunResponse` |
| `GET` | `/api/submissions/user/{userId}` | ✅ Required | — | `List<SubmissionResponse>` |
| `GET` | `/api/submissions/contest/{contestId}` | ✅ Required | — | `List<SubmissionResponse>` |
| `GET` | `/api/submissions/contest/{contestId}/user/{userId}` | ✅ Required | — | `List<SubmissionResponse>` |

**`SubmissionRequest`:** `{ userId, contestId, problemId, code, language }`  
**`RunRequest`:** `{ problemId, code, language }` — only runs against **visible** (non-hidden) test cases  
**`SubmissionResponse`:** includes `verdict, score, executionTime, passedTestCases, totalTestCases, failedTestCase, compileError, stderr`

---

### 📊 Leaderboard — `/api/leaderboard`

| Method | Path | Auth | Params | Response |
|---|---|---|---|---|
| `GET` | `/api/leaderboard/{contestId}` | ✅ Required | `?userId=` | `List<LeaderboardEntry>` |

**`LeaderboardEntry`:** `{ rank, userId, username, rollNumber, totalScore, problemsSolved, lastSubmissionTime }`

---

### 📋 Registration — `/api/registration`

| Method | Path | Auth | Body / Params | Response |
|---|---|---|---|---|
| `GET` | `/api/registration/forms` | ❌ Public | — | `List<RegistrationForm>` |
| `GET` | `/api/registration/forms/{id}` | ❌ Public | — | `RegistrationForm` |
| `GET` | `/api/registration/forms/event/{eventId}` | ❌ Public | — | `RegistrationForm` |
| `GET` | `/api/registration/forms/contest/{contestId}` | ❌ Public | — | `RegistrationForm` |
| `GET` | `/api/registration/responses/check` | ✅ Required | `?eventId=&userId=` OR `?contestId=&userId=` | `String` (status: PENDING/APPROVED/REJECTED/null) |
| `POST` | `/api/registration/forms/{id}/submit` | ✅ Required | `multipart/form-data` (answers + optional files) | `RegistrationResponse` |
| `PUT` | `/api/registration/forms/{id}/evaluation-criteria` | ✅ Required | `List<EvaluationCriterion>` | `RegistrationForm` |
| `GET` | `/api/registration/forms/{id}/responses` | ✅ Required | — | `List<RegistrationResponse>` |
| `PUT` | `/api/registration/responses/{id}/marks` | ✅ Required | `{ marks: [...], feedback: string }` | `RegistrationResponse` |

### 📋 Admin Registration — `/api/admin/registration`

| Method | Path | Auth | Body / Params | Response |
|---|---|---|---|---|
| `POST` | `/api/admin/registration/forms` | ✅ Required | `RegistrationForm` body | `RegistrationForm` |
| `PUT` | `/api/admin/registration/forms/{id}` | ✅ Required | `RegistrationForm` body | `RegistrationForm` |
| `DELETE` | `/api/admin/registration/forms/{id}` | ✅ Required | — | `204` |
| `GET` | `/api/admin/registration/forms/{id}/responses` | ✅ Required | — | `List<RegistrationResponse>` |
| `PUT` | `/api/admin/registration/responses/{id}/status` | ✅ Required | `?status=APPROVED\|REJECTED` | `RegistrationResponse` |

---

### 🏅 LeetCode — `/leetcode`

| Method | Path | Auth | Params | Response |
|---|---|---|---|---|
| `GET` | `/leetcode/questions` | ❌ Public | — | `List<LcQuestion>` |
| `GET` | `/leetcode/profile/{userId}` | ❌ Public | — | `LcUserProfileResponse` |
| `POST` | `/leetcode/sync/{userId}` | ✅ Required | — | `{ message: string }` |
| `GET` | `/leetcode/leaderboard` | ❌ Public | — | `List<Map>` (sorted by totalSolved desc) |

### 🏅 LeetCode Admin — `/admin/leetcode/questions`

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `GET` | `/admin/leetcode/questions` | ✅ Required | — | `List<LcQuestion>` |
| `GET` | `/admin/leetcode/questions/{id}` | ✅ Required | — | `LcQuestion` |
| `POST` | `/admin/leetcode/questions` | ✅ Required | `LcQuestionRequest` | `LcQuestion` |
| `PUT` | `/admin/leetcode/questions/{id}` | ✅ Required | `LcQuestionRequest` | `LcQuestion` |
| `DELETE` | `/admin/leetcode/questions/{id}` | ✅ Required | — | `String` |

---

### 📁 File Upload — `/api/upload`

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/api/upload` | ✅ Required | `multipart/form-data` with `file` field | `{ path: "string" }` |

> Uploaded files are served statically at `/uploads/<filename>` via the resource handler configured in `WebConfig.java`.

---

## 7. Code Execution Engine (Docker Sandbox)

The most technically complex part of the backend. Located in `execution/`.

### How It Works

```
Student submits code
  → SubmissionService.submitCode()
  → Rate limit check (max 1 submit per user per problem per window)
  → Validate: contest active? user registered+approved?
  → Problem already ACCEPTED? → reject
  → Create Submission(verdict=PENDING) → save to MongoDB
  → CodeExecutionService.executeCode()

CodeExecutionService:
  1. Create temp directory: /tmp/sandbox-{uuid}/
  2. Write code to file (e.g. Main.java, solution.cpp)
  3. Get LanguageStrategy for the language
  4. If compilable language (C, C++, Java):
     docker run --rm -v /tmp/sandbox-xxx:/app -w /app <image> sh -c "javac Main.java 2>&1"
     → Compile error? Return COMPILE_ERROR with stderr
  5. For each test case:
     - Write input to input.txt
     - docker run --rm --memory=256m --cpus=1.0 --network=none
                  -v /tmp/sandbox-xxx:/app -w /app <image>
                  sh -c "timeout 2s java Main < input.txt 2>&1"
     - If timedOut or exitCode=124 → TLE
     - If exitCode=137 or "Killed" → MLE
     - If exitCode≠0 → RUNTIME_ERROR
     - Trim actual output vs expected output → mismatch = WRONG_ANSWER
     - passedCount++
  6. Cleanup temp dir
  7. Score: 100 if ALL test cases pass, else 0
  8. Save final verdict to MongoDB submission
```

### Language Docker Images

| Language | Docker Image | Compile Command | Run Command |
|---|---|---|---|
| **C++** | `gcc:latest` | `g++ -o solution solution.cpp` | `./solution` |
| **C** | `gcc:latest` | `gcc -o solution solution.c` | `./solution` |
| **Java** | `openjdk:21-slim` | `javac Main.java` | `java Main` |
| **Python** | `python:3.11-slim` | _(none)_ | `python3 solution.py` |
| **JavaScript** | `node:20-slim` | _(none)_ | `node solution.js` |

### Sandbox Constraints

| Constraint | Value |
|---|---|
| **Time Limit (submit)** | 2 seconds per test case |
| **Time Limit (run/dry-run)** | 5 seconds per test case |
| **Memory Limit** | 256 MB (`--memory=256m`) |
| **CPU** | 1 core (`--cpus=1.0`) |
| **Network** | Disabled (`--network=none`) |
| **Output Limit** | 1000 lines max |

### Execution Statuses

| Status | Meaning |
|---|---|
| `ACCEPTED` | All test cases passed |
| `WRONG_ANSWER` | Output didn't match expected |
| `COMPILE_ERROR` | Compilation failed |
| `TIME_LIMIT_EXCEEDED` | Timeout (exit code 124) |
| `MEMORY_LIMIT_EXCEEDED` | OOM kill (exit code 137) |
| `RUNTIME_ERROR` | Non-zero exit code |
| `PENDING` | Submission saved, not yet judged |

### Scoring
- **All test cases pass** → `score = 100`
- **Any test case fails** → `score = 0`  
- No partial marking. Leaderboard ranks by total score across all problems, tiebroken by `lastSubmissionTime`.

### Rate Limiting (`RateLimitService`)
- In-memory map tracks `userId + problemId` → last submission time
- Prevents spam and Docker container flood

---

## 8. LeetCode Integration

### Architecture

```
Student clicks "Sync LeetCode"
  → POST /leetcode/sync/{userId}
  → LcUserService.syncUser()
    → Check 2-minute cooldown (lastSyncedTimestamp in User doc)
    → LeetCodeService.fetchRecentSubmissions(leetCodeUsername)
       → WebClient (Spring WebFlux) → POST https://leetcode.com/graphql
         GraphQL query: { recentSubmissionList { status, titleSlug, timestamp } }
    → For each "Accepted" submission:
       → Find slug in lc_questions collection
       → If found AND not already recorded:
           → Save LcUserQuestion { campusUserId, questionId, solvedAt }
    → Update user.lastSyncedTimestamp + lastSyncTime
    → Return "Sync completed. New questions added: N"
```

### Key Design Points
- **Only curated questions counted**: Admin pre-adds questions to `lc_questions` with their LC slugs. Only submissions matching those slugs are tracked.
- **Deduplication**: `existsByCampusUserIdAndQuestionId` prevents double-counting.
- **Sync cooldown**: 2-minute minimum between syncs (stored in user's `lastSyncedTimestamp`).
- **Leaderboard**: Computed on-the-fly — counts `lc_user_questions` per user, sorted descending.

---

## 9. File Upload System

### Upload Flow
```
POST /api/upload  (multipart/form-data, field: file)
  → FileUploadService.uploadFile(MultipartFile)
  → Validates file (type, size)
  → Saves to: {upload-dir}/{uuid}_{originalFilename}
  → Returns: { path: "/uploads/{uuid}_{filename}" }

Serving:
  GET /uploads/{filename}
  → WebConfig resource handler maps /uploads/** → file system
  → Served with 3600s cache
```

> **`upload-dir`** configured in `application.properties` as `file.upload-dir=uploads`  
> On the server this resolves to: `{project-root}/uploads/`

---

## 10. PDF Generation (OpenPDF)

Used in two places:

### Event Analytics PDF (`PdfExportService.java`)
- Endpoint: `GET /api/events/{id}/analytics/pdf`
- Generated server-side using OpenPDF 2.0.3
- Content: Event title, average score, top performers table, question-wise correct rate
- Returned as `application/pdf` with `Content-Disposition: attachment; filename=analytics.pdf`

### Student Profile PDF (`ProfilePage.tsx`)
- Generated **client-side** using jsPDF (frontend library)
- No backend involvement — pure browser PDF generation
- Content: Student details, club-wise MCQ/Contest/Registration activity summary

---

## 11. Data Flow — End to End

### 🔐 Authentication Flow
```
[Browser] POST /api/auth/login { username, password }
    ↓
[Spring Security] AuthenticationManager.authenticate()
    → UserDetailsServiceImpl.loadUserByUsername()
        → UserRepository.findByUsername() [MongoDB query]
    → BCryptPasswordEncoder.matches(rawPwd, storedHash)
    ↓ success
[JwtUtils] generateJwtToken(authentication)
    → Jwts.builder().setSubject(username)
         .setExpiration(now + jwtExpirationMs)
         .signWith(HS256, secret)
    ↓
[Response] { token, id, username, email, roles[] }
    ↓
[Browser] localStorage["auth_token"] = token
          localStorage["auth_user"] = JSON.stringify(user)
```

---

### 📝 MCQ Quiz Flow (Complete)
```
[Admin] POST /api/events { title, startTime, endTime, accessPassword, clubId... }
        → MongoDB: events collection created

[Admin] POST /api/questions/{eventId} [× N questions]
        → MongoDB: mcq_questions created with eventId ref

[Student] GET /api/events/{id}
        → Returns event (no questions, no answers)
        → Frontend checks startTime/endTime to derive status

[Student] POST /api/events/{id}/start?userId=&accessPassword=
        → EventService:
            1. Check accessPassword matches event.accessPassword
            2. Check user not already submitted (McqSubmission exists?)
            3. Create McqSubmission { userId, eventId, startTime=now }
            4. Return List<QuestionResponseDTO> (correctOption EXCLUDED)
        → Frontend stores questions, starts countdown

[Student] GET /api/events/{id}/remaining-time?userId=
        → RemainingTimeResponseDTO { remainingSeconds }
        → Calculated as: (startTime + durationInMinutes*60) - now

[Student] POST /api/events/{id}/submit?userId=
          Body: { answers: [{ questionId, selectedOption }] }
        → EventService:
            1. Find McqSubmission for user
            2. For each answer: compare selectedOption vs McqQuestion.correctOption
               → correct: +marks; wrong: -negativeMarks
            3. Save score to McqSubmission
            4. Calculate rank (count users with higher score)
            5. Return McqResultDTO { score, correctAnswers, wrongAnswers, rank }

[Student] GET /api/events/{id}/result?userId=
        → Returns same McqResultDTO from saved McqSubmission
```

---

### 💻 Coding Contest Flow (Complete)
```
[Admin] POST /api/contests { title, startTime, endTime, problemIds[], accessPassword }
        POST /api/problems { title, description, difficulty, testCases[] }

[Student] GET /api/contests/{id}
          GET /api/problems/{id}  (for each problemId)
        → Frontend shows problem list + editor

[Student] POST /api/submissions/run { problemId, code, language }
        → SubmissionService.runSampleTests()
        → CodeExecutionService: runs only VISIBLE (hidden=false) test cases via Docker
        → Returns RunResponse (no record saved to DB)

[Student] POST /api/submissions { userId, contestId, problemId, code, language }
        → SubmissionService.submitCode():
            1. Rate limit check
            2. Contest time window check
            3. Registration + approval check
            4. Already ACCEPTED? reject
            5. Save Submission(verdict=PENDING)
            6. CodeExecutionService.executeCode() — Docker sandbox
               → For ALL test cases (including hidden)
            7. verdict = ACCEPTED/WRONG_ANSWER/TLE/etc.
            8. score = 100 if all passed, else 0
            9. Update + save Submission
        → Return SubmissionResponse

[Student] GET /api/leaderboard/{contestId}?userId=
        → LeaderboardService:
            → Find all submissions for contest
            → Group by userId: sum scores (per unique problem ACCEPTED)
            → Sort by totalScore DESC, then lastSubmissionTime ASC
            → Return ranked List<LeaderboardEntry>
```

---

### 📋 Registration Form Flow (Complete)
```
[Admin] POST /api/admin/registration/forms
        { title, description, clubId, eventId/contestId, fields[], evaluationCriteria[] }
        → MongoDB: registration_forms created

[Student] GET /api/registration/responses/check?eventId=&userId=
        → Returns: "APPROVED" | "PENDING" | "REJECTED" | null

[Student] GET /api/registration/forms/event/{eventId}
        → Returns form with fields

[Student] POST /api/registration/forms/{id}/submit  (multipart/form-data)
        → RegistrationResponseService.submitWithFiles():
            1. Load form from DB
            2. Load user from JWT/userId param
            3. Pre-fill: name, email, rollNumber, phoneNumber, course, branch, section
            4. Parse text answers from form params
            5. Save uploaded files to /uploads dir
            6. Create RegistrationResponse { status=PENDING, answers, fileAnswers }
            7. Save to MongoDB

[Admin] GET /api/admin/registration/forms/{id}/responses
        → Returns all responses with student info

[Admin] PUT /api/admin/registration/responses/{id}/status?status=APPROVED
        → Updates response.status
        → Student now sees APPROVED on event/contest page

[Admin] PUT /api/registration/responses/{id}/marks
        Body: { marks: [{criterionId, criterionName, marksObtained}], feedback: string }
        → Calculates totalEvaluationMarks
        → Updates evaluationStatus = GRADED
        → Saves gradedBy, gradedAt

[Student] GET /api/registration/responses/check
        → Now returns "APPROVED" → can enter contest/take test
```

---

## 12. Role-Based Access Control (RBAC)

### Faculty Data Scoping
Faculty members (`FACULTY` role) see only **their own** created resources:

| Endpoint | ADMIN sees | FACULTY sees |
|---|---|---|
| `GET /api/events` | All events | Only events where `createdBy == username` |
| `GET /api/contests` | All contests | Only contests where `createdBy == username` |
| `GET /api/problems` | All problems | Only problems where `createdBy == username` |
| `GET /api/submissions` | All submissions | Only submissions for their own contests |
| `DELETE /api/events/{id}` | Any event | Only if `createdBy == username` |

### Event/Contest `createdBy` Field
- Automatically set to the **JWT username** of the requester on create
- Read from authorization header via `SecurityService.getCurrentUser(auth)`

---

## 13. Error Handling

**`GlobalExceptionHandler`** (`@ControllerAdvice`) maps exceptions to HTTP responses:

| Exception | HTTP Status | Response |
|---|---|---|
| `ResourceNotFoundException` | `404 Not Found` | `{ message: "..." }` |
| `ApiException` | `400 Bad Request` (or `403`) | `{ message: "..." }` |
| `ConstraintViolationException` | `400 Bad Request` | Validation error messages |
| `MethodArgumentNotValidException` | `400 Bad Request` | Field-level validation errors |
| General `Exception` | `500 Internal Server Error` | `{ message: "..." }` |

---

## 14. CORS Configuration

CORS is configured globally in `SecurityConfig.java`:
- **Allowed Origins:** `*` (all origins)
- **Allowed Methods:** `GET, POST, PUT, DELETE, OPTIONS`
- **Allowed Headers:** `*`
- **MaxAge:** `3600` seconds

`@CrossOrigin(origins = "*", maxAge = 3600)` also present on `AuthController` as additional coverage.

Static file uploads served at `/uploads/**` with no auth required, 3600s cache.

---

## 15. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                                 │
│                   React 19 + TypeScript + Vite                           │
│              http://35.154.206.192:8080  (VITE_API_BASE_URL)            │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │  HTTPS/HTTP REST API
                                │  Authorization: Bearer <JWT>
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    AWS EC2 — Spring Boot 3.5 (Port 8080)                 │
│                                                                           │
│  ┌──────────────┐    ┌─────────────────────────────────────────────┐    │
│  │ JwtAuthFilter│    │          REST Controllers                    │    │
│  │ (per request)│───▶│  Auth | User | Club | Event | Contest       │    │
│  └──────────────┘    │  Problem | Submission | Leaderboard         │    │
│                      │  Registration | LeetCode | Upload           │    │
│                      └──────────────────┬──────────────────────────┘    │
│                                         │                                │
│                      ┌──────────────────▼──────────────────────────┐    │
│                      │             Service Layer                    │    │
│                      │  UserService | EventService | ContestService │    │
│                      │  SubmissionService | LcUserService          │    │
│                      │  RegistrationFormService | PdfExportService  │    │
│                      └──────┬───────────────────────┬──────────────┘    │
│                             │                       │                    │
│               ┌─────────────▼──────┐   ┌───────────▼──────────────┐    │
│               │   MongoDB Repos    │   │  CodeExecutionService     │    │
│               │  (Spring Data)     │   │  (Docker sandbox)         │    │
│               └─────────────┬──────┘   └───────────┬──────────────┘    │
│                             │                       │                    │
└─────────────────────────────│───────────────────────│────────────────────┘
                              │                       │
        ┌─────────────────────▼──────┐    ┌──────────▼──────────────────┐
        │   MongoDB 7.0              │    │  Docker Engine (local)       │
        │   (docker-compose / Atlas) │    │  gcc, openjdk, python, node  │
        │   Port 27017               │    │  --memory=256m --network=none│
        │   12 collections           │    │  2s time limit per test case │
        └────────────────────────────┘    └─────────────────────────────┘
                                                         │
                                         ┌───────────────▼──────────────┐
                                         │  External: LeetCode GraphQL   │
                                         │  https://leetcode.com/graphql │
                                         │  (WebClient / Spring WebFlux) │
                                         └──────────────────────────────┘
```

---

## 16. Running Locally — Setup Guide

### Prerequisites
- Java 21 JDK
- Maven 3.8+
- Docker Desktop (for code execution sandbox + MongoDB)
- Node.js 20+ (for frontend)

### Step 1: Start MongoDB
```bash
docker-compose up -d
# MongoDB running at localhost:27017
# Username: admin | Password: password | DB: mydb
```

### Step 2: Configure `application.properties`
Create `src/main/resources/application.properties`:
```properties
# MongoDB
spring.data.mongodb.uri=mongodb://admin:password@localhost:27017/mydb?authSource=admin

# JWT
app.jwtSecret=your-256-bit-secret-key-here-make-it-long-enough
app.jwtExpirationMs=86400000

# File upload
file.upload-dir=uploads
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Server
server.port=8080

# Swagger
springdoc.swagger-ui.path=/swagger-ui.html
```

### Step 3: Run Backend
```bash
./mvnw spring-boot:run
# OR
mvn spring-boot:run

# API available at: http://localhost:8080
# Swagger UI:       http://localhost:8080/swagger-ui.html
```

### Step 4: Run Frontend
```bash
cd frontend
npm install
# Edit .env: VITE_API_BASE_URL=http://localhost:8080
npm run dev
# Available at: http://localhost:5173
```

### Step 5: Create First Admin User
```bash
# Register via API (starts as USER role)
POST http://localhost:8080/user
{ "username": "admin", "password": "admin123", ... }

# Manually update role in MongoDB:
db.users.updateOne({ username: "admin" }, { $set: { role: "ADMIN" } })
```

### Step 6: Docker Images for Code Execution
```bash
# Pre-pull Docker images to speed up first execution
docker pull gcc:latest
docker pull openjdk:21-slim
docker pull python:3.11-slim
docker pull node:20-slim
```

---

## 17. Key Business Logic

### MCQ Scoring
- **Correct answer:** `+marks` (question-level)
- **Wrong answer:** `-negativeMarks` (can be 0 or positive value)
- **Unanswered:** `0`
- **Total score:** Sum of all, clamped to `≥ 0`
- **Rank:** Count of users with `score > currentUser.score` + 1

### Coding Contest Scoring
- Per-problem: `100` if ACCEPTED, `0` otherwise
- No partial marking
- Leaderboard: `totalScore DESC`, tiebreaker: `lastSubmissionTime ASC` (earlier = better)
- Duplicate ACCEPTED submissions blocked: `existsByUserIdAndProblemIdAndContestIdAndVerdict("ACCEPTED")`

### Registration Workflow
1. Admin creates a form linked to `eventId` or `contestId`
2. Student fills + submits → status `PENDING`
3. Admin approves → status `APPROVED`
4. `APPROVED` students get access to start test / enter contest

### Event/Contest Visibility Scoping
When `getAllEvents()` / `getAllContests()` is called with a FACULTY auth token:
- Service filters to only return items where `createdBy == currentUser.username`
- ADMIN and USER roles see all events/contests

### LeetCode Sync Cooldown
- Per-user 2-minute cooldown tracked via `user.lastSyncedTimestamp` (epoch ms)
- Enforced in `LcUserService.syncUser()` before any LeetCode API call
- Prevents rate-limiting from LeetCode's GraphQL API

### File Upload for Registration Responses
- Registration form submission is `multipart/form-data`
- Text answers parsed from parameter map (key = fieldId, value = answer)
- File fields saved to `/uploads/` directory and URL stored in answers map
- Files served publicly at `/uploads/{filename}`

---

*This document covers the complete backend of `e:\PROJECT\CampusArena\src\main\java\com\campusarena\eventhub`*  
*Last Updated: 2026-03-13*
