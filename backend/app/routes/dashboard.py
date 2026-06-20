from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Enrollment, LessonProgress, Course, Lesson, ActivityEvent
from app.utils import current_user_id, require_role
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/student")
def student_dashboard(user_id: int = Depends(current_user_id), claims: dict = Depends(require_role("STUDENT")), db: Session = Depends(get_db)):
    completed_lessons = db.query(LessonProgress).filter(
        LessonProgress.student_id == user_id, LessonProgress.status == 'COMPLETED'
    ).count()

    total_time_result = db.query(func.sum(LessonProgress.time_spent_minutes)).filter(
        LessonProgress.student_id == user_id
    ).scalar()
    total_time_spent = int(total_time_result) if total_time_result else 0

    enrollments = db.query(Enrollment).filter(Enrollment.student_id == user_id).all()
    if enrollments:
        average_progress = sum(e.progress_percent for e in enrollments) / len(enrollments)
    else:
        average_progress = 0

    courses_data = []
    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        total_lessons = db.query(Lesson).filter(Lesson.course_id == course.id).count()
        completed = db.query(LessonProgress).join(Lesson).filter(
            LessonProgress.student_id == user_id,
            LessonProgress.lesson_id == Lesson.id,
            Lesson.course_id == course.id,
            LessonProgress.status == 'COMPLETED'
        ).count()
        
        courses_data.append({
            "id": course.id,
            "title": course.title,
            "progressPercent": enrollment.progress_percent,
            "completedLessons": completed,
            "totalLessons": total_lessons
        })

    now = datetime.utcnow()
    last_active = None
    time_series = []
    
    recent_activity = db.query(ActivityEvent).filter(ActivityEvent.student_id == user_id).order_by(ActivityEvent.created_at.desc()).first()
    if recent_activity:
        last_active = recent_activity.created_at.strftime('%Y-%m-%d')
        
    for i in range(6, -1, -1):
        date = (now - timedelta(days=i)).date()
        start = datetime.combine(date, datetime.min.time())
        end = start + timedelta(days=1)
        minutes = db.query(func.sum(ActivityEvent.duration_minutes)).filter(
            ActivityEvent.student_id == user_id,
            ActivityEvent.type == 'TIME_SPENT',
            ActivityEvent.created_at >= start,
            ActivityEvent.created_at < end
        ).scalar()
        time_series.append({
            "date": date.strftime('%b %d'),
            "minutes": int(minutes) if minutes else 0
        })

    in_progress = db.query(LessonProgress).filter(LessonProgress.student_id == user_id, LessonProgress.status == 'IN_PROGRESS').count()
    total_lessons_enrolled = sum(c['totalLessons'] for c in courses_data)
    not_started = max(0, total_lessons_enrolled - completed_lessons - in_progress)
    
    completion_distribution = [
        {"name": "Completed", "value": completed_lessons},
        {"name": "In Progress", "value": in_progress},
        {"name": "Not Started", "value": not_started}
    ]

    recommendations = []
    for c in courses_data:
        if c['progressPercent'] < 40 and c['progressPercent'] > 0:
            recommendations.append({
                "title": f"Continue {c['title']}",
                "reason": f"You are {c['progressPercent']}% through this course."
            })
            break

    in_progress_lesson = db.query(LessonProgress).filter(LessonProgress.student_id == user_id, LessonProgress.status == 'IN_PROGRESS').first()
    if in_progress_lesson:
        lesson = db.query(Lesson).filter(Lesson.id == in_progress_lesson.lesson_id).first()
        if lesson:
            recommendations.append({
                "title": f"Finish {lesson.title}",
                "reason": "This lesson is already in progress."
            })

    last_activity = db.query(ActivityEvent).filter(ActivityEvent.student_id == user_id).order_by(ActivityEvent.created_at.desc()).first()
    if not last_activity or last_activity.created_at < now - timedelta(days=3):
        recommendations.append({
            "title": "Resume your learning streak",
            "reason": "You have not studied in the last 3 days."
        })

    week_minutes = sum(point["minutes"] for point in time_series)
    if week_minutes < 90:
        recommendations.append({
            "title": "Try a short lesson this week",
            "reason": "Your study time is low this week."
        })

    if not recommendations:
        recommendations.append({
            "title": "Start a new lesson",
            "reason": "Keep up the good work!"
        })

    return {
        "completedLessons": completed_lessons,
        "totalTimeSpent": total_time_spent,
        "averageProgress": round(average_progress),
        "lastActive": last_active,
        "courses": courses_data,
        "timeSeries": time_series,
        "completionDistribution": completion_distribution,
        "recommendations": recommendations[:2]
    }
