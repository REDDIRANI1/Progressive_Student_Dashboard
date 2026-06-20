import csv
from io import StringIO
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Course, Enrollment, Lesson, LessonProgress, User, MentorStudent
from app.utils import current_user_id, get_current_user_claims

router = APIRouter(prefix="/api/export", tags=["export"])

@router.get("/progress.csv")
def export_progress_csv(user_id: int = Depends(current_user_id), claims: dict = Depends(get_current_user_claims), db: Session = Depends(get_db)):
    if claims.get('role') == 'MENTOR':
        student_ids = [ms.student_id for ms in db.query(MentorStudent).filter(MentorStudent.mentor_id == user_id).all()]
    else:
        student_ids = [user_id]

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Student name', 'Course', 'Completed lessons', 'Total lessons', 'Time spent', 'Progress percentage'])

    enrollments = db.query(Enrollment).filter(Enrollment.student_id.in_(student_ids)).all()
    for enrollment in enrollments:
        student = db.query(User).filter(User.id == enrollment.student_id).first()
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if not student or not course:
            continue
        total_lessons = db.query(Lesson).filter(Lesson.course_id == course.id).count()
        lessons = db.query(Lesson).filter(Lesson.course_id == course.id).all()
        lesson_ids = [lesson.id for lesson in lessons]
        
        if lesson_ids:
            completed = db.query(LessonProgress).filter(
                LessonProgress.student_id == student.id,
                LessonProgress.lesson_id.in_(lesson_ids),
                LessonProgress.status == 'COMPLETED'
            ).count()
            
            progress_entries = db.query(LessonProgress).filter(
                LessonProgress.student_id == student.id,
                LessonProgress.lesson_id.in_(lesson_ids)
            ).all()
            time_spent = sum(progress.time_spent_minutes for progress in progress_entries)
        else:
            completed = 0
            time_spent = 0
            
        writer.writerow([student.name, course.title, completed, total_lessons, time_spent, enrollment.progress_percent])

    return Response(
        content=output.getvalue(),
        media_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename=progress.csv'}
    )
