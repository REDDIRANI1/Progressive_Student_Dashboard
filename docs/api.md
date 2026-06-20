# API Documentation

## Base URL
`/api`

## Authentication
Protected routes require a `Bearer <token>` in the Authorization header.

### `POST /auth/signup`
Creates a new user.
- **Body**: `{ "name": "John", "email": "john@example.com", "password": "pass", "role": "STUDENT" }`
- **Response**: `201 Created`

### `POST /auth/login`
Authenticates a user and returns a JWT token.
- **Body**: `{ "email": "john@example.com", "password": "pass" }`
- **Response**: `200 OK` `{ "access_token": "...", "user": { ... } }`

### `GET /auth/me`
Gets the current logged-in user.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` `{ "id": 1, "name": "John", ... }`

---

## Dashboard

### `GET /dashboard/student`
Gets the student dashboard stats, charts data, and recommendations.
- **Headers**: `Authorization: Bearer <token>` (Role: STUDENT)
- **Response**: `200 OK`
```json
{
  "completedLessons": 18,
  "totalTimeSpent": 420,
  "averageProgress": 64,
  "courses": [ ... ],
  "timeSeries": [ ... ],
  "completionDistribution": [ ... ],
  "recommendations": [ ... ]
}
```

---

## Analytics

### `GET /analytics/summary`
Returns student aggregate metrics.
- **Headers**: `Authorization: Bearer <token>` (Role: STUDENT)
- **Response**: `200 OK` `{ "completedLessons": 12, "totalTimeSpent": 300, "averageProgress": 50, "activeCourses": 3 }`

### `GET /analytics/time-series`
Returns daily learning minutes for the last 14 days.
- **Headers**: `Authorization: Bearer <token>` (Role: STUDENT)
- **Response**: `200 OK` `[{ "date": "2026-06-20", "minutes": 45 }]`

---

## Courses & Lessons

### `GET /courses`
Lists all courses.
- **Headers**: `Authorization: Bearer <token>` (Role: STUDENT)
- **Response**: `200 OK` `[{ "id": 1, "title": "Math", ... }]`

### `GET /courses/:id`
Gets course details, lessons with progress status, and recent course activity history.
- **Headers**: `Authorization: Bearer <token>` (Role: STUDENT)
- **Response**: `200 OK` `{ "id": 1, "title": "Math", "lessons": [...] }`

### `GET /courses/:id/progress`
Gets the enrollment progress percentage for a specific course.
- **Headers**: `Authorization: Bearer <token>` (Role: STUDENT)
- **Response**: `200 OK` `{ "courseId": 1, "progressPercent": 50 }`

### `GET /lessons/:id`
Gets lesson details and current status.
- **Headers**: `Authorization: Bearer <token>` (Role: STUDENT)
- **Response**: `200 OK` `{ "id": 1, "title": "Lesson 1", "status": "COMPLETED", ... }`

### `POST /lessons/:id/complete`
Marks a lesson as complete, records time spent, and updates course progress.
- **Headers**: `Authorization: Bearer <token>` (Role: STUDENT)
- **Body** (Optional): `{ "timeSpentMinutes": 30 }`
- **Response**: `200 OK` `{ "message": "Lesson marked as complete", "progressPercent": 60 }`

---

## Activity

### `GET /activity`
Gets recent activity events for the student.
- **Headers**: `Authorization: Bearer <token>` (Role: STUDENT)
- **Response**: `200 OK` `[{ "id": 1, "type": "LESSON_COMPLETED", "durationMinutes": 30, ... }]`

### `POST /activity`
Manually logs an activity event.
- **Headers**: `Authorization: Bearer <token>` (Role: STUDENT)
- **Body**: `{ "type": "TIME_SPENT", "courseId": 1, "lessonId": 2, "durationMinutes": 20 }`
  - Allowed types: `LESSON_STARTED`, `LESSON_COMPLETED`, `TIME_SPENT`
  - `durationMinutes` must be non-negative.
- **Response**: `201 Created` `{ "message": "Activity recorded" }`

---

## Export

### `GET /export/progress.csv`
Downloads progress as CSV.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` CSV with `Student name, Course, Completed lessons, Total lessons, Time spent, Progress percentage`

---

## Mentor

### `GET /mentor/students`
Gets all students assigned to the mentor and their aggregate progress.
- **Headers**: `Authorization: Bearer <token>` (Role: MENTOR)
- **Response**: `200 OK` `[{ "id": 2, "name": "Demo Student", "overallProgress": 60, "totalTimeSpent": 500, "coursesNeedingAttention": [...] }]`

### `GET /mentor/students/:studentId/dashboard`
Gets a specific student's dashboard stats, course progress, and recent activity for mentor drill-down views.
- **Headers**: `Authorization: Bearer <token>` (Role: MENTOR)
- **Response**: `200 OK` `{ "completedLessons": 18, ... }`
