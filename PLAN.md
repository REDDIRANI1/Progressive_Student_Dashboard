# Progressive Student Dashboard — Hackathon Plan

## Problem Statement Alignment

This plan is for **Challenge 1: Progressive Student Dashboard**.

Required by the problem statement:

- Track student progress across courses
- Recommend next steps
- Visualize learning insights
- Email authentication
- Student + mentor roles
- Dashboard showing completed lessons, time spent, and progress per course
- Trend chart/time-series visualization
- Pie/donut distribution visualization
- Backend API for auth, aggregates/time-series, lesson details, and activity events
- Seeded sample data
- Clear setup instructions

## 1. Recommended Tech Stack

Use a stack that is fast to build and easy to demo.

### Frontend

- React.js with Vite
- JavaScript for speed
- TypeScript optional only if time allows
- Tailwind CSS
- shadcn/ui for clean UI components
- Recharts for charts

### Backend

- Python Flask REST API
- Flask-CORS for frontend/backend communication
- Flask-JWT-Extended for authentication
- Werkzeug or bcrypt for password hashing

### Database

- PostgreSQL using Supabase or Neon
- SQLite for local demo if time is short

### ORM

- SQLAlchemy
- Flask-Migrate/Alembic for migrations

### Authentication

- JWT-based email/password login
- Roles: `STUDENT`, `MENTOR`
- Store hashed passwords only

### Deployment

- Frontend: Vercel or Netlify
- Backend: Render, Railway, or Fly.io
- Database: Supabase/Neon PostgreSQL

---

## 2. Core MVP Features

### Authentication

Users can:

- Sign up/login with email
- Have a role: student or mentor
- Be redirected based on role

Example:

- Student goes to `/dashboard`
- Mentor goes to `/mentor`

---

## 3. Main Screens

### Student Dashboard

Show:

1. **Stats cards**
   - Completed lessons
   - Total time spent
   - Average progress
   - Current streak or last active date

2. **Progress per course**
   - Course name
   - Progress percentage
   - Completed lessons / total lessons

3. **Trend chart**
   - Time spent per day/week
   - Example: line chart

4. **Donut chart**
   - Completed vs in-progress vs not-started lessons

5. **Recommended next steps**
   - Example:
     - “Continue Algebra Basics”
     - “Revise lesson: Fractions”
     - “You spent less time on Biology this week”

---

### Course Detail Page

Route: `/courses/[id]`

Show:

- Course title
- Lessons list
- Lesson status:
  - Not started
  - In progress
  - Completed
- Time spent per lesson
- Button to mark lesson complete
- Activity history

---

### Mentor Dashboard

Route: `/mentor`

Show:

- List of assigned students
- Each student’s:
  - Overall progress
  - Time spent
  - Courses needing attention
- Click student to view detailed progress

This is a strong stretch feature but very valuable for judging.

---

## 4. Database Design

### User

```ts
User {
  id
  name
  email
  passwordHash
  role // STUDENT or MENTOR
  createdAt
}
```

### Course

```ts
Course {
  id
  title
  description
  level
  createdAt
}
```

### Lesson

```ts
Lesson {
  id
  courseId
  title
  description
  order
  estimatedMinutes
}
```

### Enrollment

```ts
Enrollment {
  id
  studentId
  courseId
  progressPercent
  enrolledAt
}
```

### LessonProgress

```ts
LessonProgress {
  id
  studentId
  lessonId
  status // NOT_STARTED, IN_PROGRESS, COMPLETED
  timeSpentMinutes
  completedAt
  updatedAt
}
```

### ActivityEvent

```ts
ActivityEvent {
  id
  studentId
  courseId
  lessonId
  type // LESSON_STARTED, LESSON_COMPLETED, TIME_SPENT
  durationMinutes
  createdAt
}
```

### MentorStudent

```ts
MentorStudent {
  id
  mentorId
  studentId
}
```

---

## 5. Backend API Plan

### Auth

```txt
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

For Flask, implement these as REST endpoints. Return a JWT access token after login and use role-based checks for protected routes.

---

### Student Dashboard / Aggregates / Time-Series

```txt
GET /api/dashboard/student
GET /api/analytics/summary
GET /api/analytics/time-series
```

Returns:

```json
{
  "completedLessons": 18,
  "totalTimeSpent": 420,
  "averageProgress": 64,
  "courses": [],
  "timeSeries": [],
  "completionDistribution": [],
  "recommendations": []
}
```

---

### Course Progress + Lesson Details + Activity Events

```txt
GET  /api/courses
GET  /api/courses/:id
GET  /api/courses/:id/progress
GET  /api/lessons/:id
POST /api/lessons/:id/complete
GET  /api/activity
POST /api/activity
```

---

### Mentor APIs

```txt
GET /api/mentor/students
GET /api/mentor/students/:studentId/dashboard
```

---

### Export

```txt
GET /api/export/progress.csv
```

Returns CSV with:

- Student name
- Course
- Completed lessons
- Total lessons
- Time spent
- Progress percentage

---

## 6. Charts to Build

### Trend Chart

Use line chart.

Data example:

```json
[
  { "date": "2026-06-01", "minutes": 40 },
  { "date": "2026-06-02", "minutes": 55 },
  { "date": "2026-06-03", "minutes": 20 }
]
```

Shows learning time over time.

---

### Donut Chart

Data example:

```json
[
  { "name": "Completed", "value": 18 },
  { "name": "In Progress", "value": 6 },
  { "name": "Not Started", "value": 12 }
]
```

Shows lesson completion status.

---

## 7. Recommendation Logic

Keep it simple but useful.

Rules:

1. If a course progress is under 40%:
   - Recommend continuing that course.

2. If student has not studied in 3 days:
   - Recommend resuming learning.

3. If a lesson is in progress:
   - Recommend finishing that lesson.

4. If time spent is low this week:
   - Recommend a short lesson.

Example output:

```json
[
  {
    "title": "Continue Algebra Basics",
    "reason": "You are 35% through this course."
  },
  {
    "title": "Finish Fractions Lesson",
    "reason": "This lesson is already in progress."
  }
]
```

---

## 8. Seed Data Plan

Create seeded sample data:

- 1 mentor
- 3 to 5 students
- 3 courses:
  - Mathematics
  - Biology
  - English Writing
- 8 to 12 lessons per course
- Random progress data
- Activity events across last 14 days

Demo accounts:

```txt
Student:
email: student@example.com
password: password123

Mentor:
email: mentor@example.com
password: password123
```

---

## 9. Implementation Roadmap

### Phase 1 — Project Setup

- Create React + Vite frontend
- Create Python Flask backend
- Add Tailwind CSS
- Add SQLAlchemy + Flask-Migrate
- Setup database
- Create SQLAlchemy models
- Add seed script

---

### Phase 2 — Authentication

- Implement signup/login
- Add role-based routing
- Protect dashboard pages
- Add demo users

---

### Phase 3 — Student Dashboard

- Build layout
- Add stats cards
- Add progress per course
- Add trend chart using time-series API
- Add donut chart using completion distribution data
- Add basic recommended next steps
- Connect to Flask API

---

### Phase 4 — Course + Lesson Progress

- Course listing page
- Course detail page
- Lesson progress status
- Mark lesson complete
- Track time spent/activity events

---

### Phase 5 — Mentor Role + Mentor Dashboard

- Mentor login with protected mentor-only route
- Mentor student list
- Student progress overview
- Individual student dashboard view

---

### Phase 6 — Polish

- Responsive design
- Loading states
- Empty states
- Error states
- Nice dashboard cards
- Screenshots
- README setup instructions
- API documentation

---

### Phase 7 — Stretch Features

If time remains:

1. CSV export
2. Advanced recommendation logic
3. Tests
4. Dark mode
5. More advanced mentor insights

---

## 10. Suggested Folder Structure

```txt
student-dashboard/
  frontend/
    src/
      pages/
        Login.jsx
        Signup.jsx
        StudentDashboard.jsx
        CourseDetail.jsx
        MentorDashboard.jsx
      components/
        charts/
        dashboard/
        layout/
        ui/
      lib/
        api.js
        auth.js
      App.jsx
      main.jsx
    package.json

  backend/
    app/
      __init__.py
      models.py
      routes/
        auth.py
        dashboard.py
        analytics.py
        courses.py
        lessons.py
        activity.py
        mentor.py
        export.py
      services/
        recommendations.py
        aggregates.py
      seed.py
    migrations/
    requirements.txt
    run.py

  docs/
    api.md
    screenshots/
  README.md
```

---

## 11. README Must Include

Your final repo should clearly show:

```txt
1. Project overview
2. Tech stack
3. Features
4. Setup instructions
5. Environment variables
6. Database migration commands
7. Seed command
8. Demo login credentials
9. API documentation link
10. Screenshots
```

---

## 12. Demo Flow for Judges

Use this flow:

1. Login as student
2. Show dashboard stats
3. Explain progress chart
4. Explain time trend chart
5. Show recommendations
6. Open course detail page
7. Mark lesson complete
8. Show dashboard updates
9. Login as mentor
10. Show mentor can monitor students
11. Export CSV if implemented

---

## Best MVP Scope

For hackathon, build this first:

- Email login
- Student + mentor role protection
- Student dashboard
- Completed lessons, time spent, and progress per course
- Backend APIs for auth, aggregates/time-series, lesson details, and activity events
- Trend chart
- Donut chart
- Basic recommendations
- Course detail and lesson completion
- Basic mentor dashboard
- Seed data
- README setup instructions
- API documentation
- Screenshots

Then add:

- CSV export
- Tests
- Dark mode
- Advanced mentor insights
