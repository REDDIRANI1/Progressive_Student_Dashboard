# Progressive Student Dashboard — Task Breakdown

Use this as the implementation checklist. Finish the MVP first, then do stretch features only if time remains.

## MVP Priority

1. Setup project
2. Database + seed data
3. Auth + roles
4. Student dashboard APIs
5. Student dashboard UI + charts
6. Course detail + lesson progress
7. Basic mentor dashboard
8. README + API docs + screenshots

---

## Phase 1 — Setup

- [ ] Create `frontend/` with React + Vite
- [ ] Create `backend/` with Python Flask
- [ ] Setup Tailwind CSS in frontend
- [ ] Install Recharts
- [ ] Setup Flask-CORS
- [ ] Setup Flask-JWT-Extended
- [ ] Setup SQLAlchemy
- [ ] Setup Flask-Migrate/Alembic
- [ ] Add root `.env.example`
- [ ] Add frontend/backend run instructions to README

---

## Phase 2 — Database + Seed Data

- [ ] Create `User` model
- [ ] Create `Course` model
- [ ] Create `Lesson` model
- [ ] Create `Enrollment` model
- [ ] Create `LessonProgress` model
- [ ] Create `ActivityEvent` model
- [ ] Create `MentorStudent` model
- [ ] Add database migration
- [ ] Add seed script
- [ ] Seed 1 mentor account
- [ ] Seed 3 to 5 student accounts
- [ ] Seed 3 courses
- [ ] Seed 8 to 12 lessons per course
- [ ] Seed progress data
- [ ] Seed activity events for last 14 days

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

## Phase 3 — Authentication + Roles

- [ ] Implement `POST /api/auth/signup`
- [ ] Implement `POST /api/auth/login`
- [ ] Implement `GET /api/auth/me`
- [ ] Hash passwords before storing
- [ ] Return JWT token on login
- [ ] Add backend JWT auth middleware/decorator
- [ ] Add student-only route protection
- [ ] Add mentor-only route protection
- [ ] Build frontend login page
- [ ] Build frontend signup page
- [ ] Store token on frontend
- [ ] Redirect students to `/dashboard`
- [ ] Redirect mentors to `/mentor`
- [ ] Add logout

---

## Phase 4 — Student Dashboard APIs

- [ ] Implement `GET /api/dashboard/student`
- [ ] Implement `GET /api/analytics/summary`
- [ ] Implement `GET /api/analytics/time-series`
- [ ] Return completed lessons count
- [ ] Return total time spent
- [ ] Return average progress
- [ ] Return progress per course
- [ ] Return time-series data for trend chart
- [ ] Return completion distribution for donut chart
- [ ] Return basic recommendations

Expected dashboard response shape:

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

## Phase 5 — Student Dashboard UI

- [ ] Build dashboard page at `/dashboard`
- [ ] Add stats cards
- [ ] Add completed lessons card
- [ ] Add total time spent card
- [ ] Add average progress card
- [ ] Add last active/streak card
- [ ] Add progress per course section
- [ ] Add Recharts trend line chart
- [ ] Add Recharts donut chart
- [ ] Add recommendations panel
- [ ] Add loading state
- [ ] Add error state
- [ ] Make dashboard responsive

---

## Phase 6 — Courses + Lessons

- [ ] Implement `GET /api/courses`
- [ ] Implement `GET /api/courses/:id`
- [ ] Implement `GET /api/courses/:id/progress`
- [ ] Implement `GET /api/lessons/:id`
- [ ] Implement `POST /api/lessons/:id/complete`
- [ ] Implement `GET /api/activity`
- [ ] Implement `POST /api/activity`
- [ ] Build course list page
- [ ] Build course detail page at `/courses/:id`
- [ ] Show lesson list
- [ ] Show lesson status: not started, in progress, completed
- [ ] Show time spent per lesson
- [ ] Add mark lesson complete button
- [ ] Create activity event when lesson is completed
- [ ] Update progress after completion

---

## Phase 7 — Mentor Dashboard

- [ ] Implement `GET /api/mentor/students`
- [ ] Implement `GET /api/mentor/students/:studentId/dashboard`
- [ ] Build mentor dashboard page at `/mentor`
- [ ] Show assigned students
- [ ] Show each student's overall progress
- [ ] Show each student's total time spent
- [ ] Show courses needing attention
- [ ] Add student detail view or modal
- [ ] Protect mentor dashboard from student users

---

## Phase 8 — Documentation + Polish

- [ ] Create complete `README.md`
- [ ] Add project overview
- [ ] Add tech stack
- [ ] Add feature list
- [ ] Add setup instructions
- [ ] Add environment variable instructions
- [ ] Add database migration command
- [ ] Add seed command
- [ ] Add demo login credentials
- [ ] Create `docs/api.md`
- [ ] Document auth APIs
- [ ] Document dashboard APIs
- [ ] Document course/lesson APIs
- [ ] Document mentor APIs
- [ ] Add screenshots to `docs/screenshots/`
- [ ] Add responsive UI polish
- [ ] Add empty states
- [ ] Add better error messages

---

## Stretch Features

Only start these after the MVP works end-to-end.

- [ ] Implement `GET /api/export/progress.csv`
- [ ] Add CSV export button
- [ ] Add advanced recommendation logic
- [ ] Add frontend tests
- [ ] Add backend tests
- [ ] Add dark mode
- [ ] Add advanced mentor insights

---

## Demo Flow Checklist

- [ ] Login as student
- [ ] Show dashboard stats
- [ ] Explain progress per course
- [ ] Explain trend chart
- [ ] Explain donut chart
- [ ] Explain recommendations
- [ ] Open course detail page
- [ ] Mark lesson complete
- [ ] Show dashboard updates
- [ ] Login as mentor
- [ ] Show mentor dashboard
- [ ] Show API docs and setup instructions
