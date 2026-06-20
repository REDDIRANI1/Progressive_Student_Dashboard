from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, MentorStudent, Enrollment, LessonProgress, Course, Lesson, ActivityEvent
from app.utils import current_user_id, require_role

router = APIRouter(prefix="/api/mentor", tags=["mentor"])

@router.get("/students")
def get_students(user_id: int = Depends(current_user_id), claims: dict = Depends(require_role("MENTOR")), db: Session = Depends(get_db)):
    mentor_students = db.query(MentorStudent).filter(MentorStudent.mentor_id == user_id).all()
    
    result = []
    for ms in mentor_students:
        student = db.query(User).filter(User.id == ms.student_id).first()
        if not student:
            continue
        enrollments = db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
        avg_progress = sum(e.progress_percent for e in enrollments) / len(enrollments) if enrollments else 0
        total_time_result = db.query(func.sum(LessonProgress.time_spent_minutes)).filter(LessonProgress.student_id == student.id).scalar()
        total_time_spent = int(total_time_result) if total_time_result else 0
        
        needs_attention = []
        for e in enrollments:
            if e.progress_percent < 30:
                course = db.query(Course).filter(Course.id == e.course_id).first()
                if course:
                    needs_attention.append(course.title)
                    
        result.append({
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "overallProgress": round(avg_progress),
            "totalTimeSpent": total_time_spent,
            "coursesNeedingAttention": needs_attention
        })
    return result

@router.get("/students/{student_id}/dashboard")
def student_dashboard(student_id: int, user_id: int = Depends(current_user_id), claims: dict = Depends(require_role("MENTOR")), db: Session = Depends(get_db)):
    if not db.query(MentorStudent).filter(MentorStudent.mentor_id == user_id, MentorStudent.student_id == student_id).first():
        return JSONResponse(status_code=403, content={"message": "Unauthorized to view this student"})

    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
        
    completed_lessons = db.query(LessonProgress).filter(LessonProgress.student_id == student_id, LessonProgress.status == 'COMPLETED').count()
    total_time_result = db.query(func.sum(LessonProgress.time_spent_minutes)).filter(LessonProgress.student_id == student_id).scalar()
    total_time_spent = int(total_time_result) if total_time_result else 0
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student_id).all()
    average_progress = sum(e.progress_percent for e in enrollments) / len(enrollments) if enrollments else 0

    courses_data = []
    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if not course:
            continue
        total_lessons = db.query(Lesson).filter(Lesson.course_id == course.id).count()
        completed = db.query(LessonProgress).join(Lesson).filter(
            LessonProgress.student_id == student_id,
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

    recent_activity = db.query(ActivityEvent).filter(ActivityEvent.student_id == student_id).order_by(ActivityEvent.created_at.desc()).limit(20).all()
    return {
        "student": {"id": student.id, "name": student.name, "email": student.email},
        "completedLessons": completed_lessons,
        "totalTimeSpent": total_time_spent,
        "averageProgress": round(average_progress),
        "courses": courses_data,
        "activity": [{
            "id": event.id,
            "courseId": event.course_id,
            "lessonId": event.lesson_id,
            "type": event.type,
            "durationMinutes": event.duration_minutes,
            "createdAt": event.created_at.isoformat()
        } for event in recent_activity]
    }
