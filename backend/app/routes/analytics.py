from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import ActivityEvent, Enrollment, LessonProgress
from app.utils import current_user_id, require_role

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/summary")
def summary(user_id: int = Depends(current_user_id), claims: dict = Depends(require_role("STUDENT")), db: Session = Depends(get_db)):
    completed_lessons = db.query(LessonProgress).filter(LessonProgress.student_id == user_id, LessonProgress.status == 'COMPLETED').count()
    total_time = db.query(func.sum(LessonProgress.time_spent_minutes)).filter(LessonProgress.student_id == user_id).scalar() or 0
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == user_id).all()
    average_progress = round(sum(enrollment.progress_percent for enrollment in enrollments) / len(enrollments)) if enrollments else 0

    return {
        "completedLessons": completed_lessons,
        "totalTimeSpent": int(total_time),
        "averageProgress": average_progress,
        "activeCourses": len(enrollments)
    }

@router.get("/time-series")
def time_series(user_id: int = Depends(current_user_id), claims: dict = Depends(require_role("STUDENT")), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    series = []

    for i in range(13, -1, -1):
        date = (now - timedelta(days=i)).date()
        start = datetime.combine(date, datetime.min.time())
        end = start + timedelta(days=1)
        minutes = db.query(func.sum(ActivityEvent.duration_minutes)).filter(
            ActivityEvent.student_id == user_id,
            ActivityEvent.type == 'TIME_SPENT',
            ActivityEvent.created_at >= start,
            ActivityEvent.created_at < end
        ).scalar() or 0
        series.append({"date": date.strftime('%Y-%m-%d'), "minutes": int(minutes)})

    return series
