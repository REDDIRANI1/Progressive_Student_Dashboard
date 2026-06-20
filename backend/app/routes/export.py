import csv
from io import StringIO
from flask import Blueprint, Response
from flask_jwt_extended import jwt_required
from app.models import Course, Enrollment, Lesson, LessonProgress, User
from app.utils import current_user_id, current_claims

export_bp = Blueprint('export', __name__, url_prefix='/api/export')

@export_bp.route('/progress.csv', methods=['GET'])
@jwt_required()
def export_progress_csv():
    user_id = current_user_id()
    claims = current_claims()

    if claims.get('role') == 'MENTOR':
        from app.models import MentorStudent
        student_ids = [ms.student_id for ms in MentorStudent.query.filter_by(mentor_id=user_id).all()]
    else:
        student_ids = [user_id]

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Student name', 'Course', 'Completed lessons', 'Total lessons', 'Time spent', 'Progress percentage'])

    enrollments = Enrollment.query.filter(Enrollment.student_id.in_(student_ids)).all()
    for enrollment in enrollments:
        student = User.query.get(enrollment.student_id)
        course = Course.query.get(enrollment.course_id)
        if not student or not course:
            continue
        total_lessons = Lesson.query.filter_by(course_id=course.id).count()
        lesson_ids = [lesson.id for lesson in Lesson.query.filter_by(course_id=course.id).all()]
        completed = LessonProgress.query.filter(
            LessonProgress.student_id == student.id,
            LessonProgress.lesson_id.in_(lesson_ids),
            LessonProgress.status == 'COMPLETED'
        ).count() if lesson_ids else 0
        time_spent = sum(progress.time_spent_minutes for progress in LessonProgress.query.filter(
            LessonProgress.student_id == student.id,
            LessonProgress.lesson_id.in_(lesson_ids)
        ).all()) if lesson_ids else 0
        writer.writerow([student.name, course.title, completed, total_lessons, time_spent, enrollment.progress_percent])

    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=progress.csv'}
    )
