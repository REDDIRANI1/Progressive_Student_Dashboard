from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from app import db
from app.models import User, MentorStudent, Enrollment, LessonProgress, Course, Lesson, ActivityEvent
from app.utils import current_user_id, role_required

mentor_bp = Blueprint('mentor', __name__, url_prefix='/api/mentor')

@mentor_bp.route('/students', methods=['GET'])
@jwt_required()
@role_required('MENTOR')
def get_students():
    mentor_id = current_user_id()
    mentor_students = MentorStudent.query.filter_by(mentor_id=mentor_id).all()
    
    result = []
    for ms in mentor_students:
        student = User.query.get(ms.student_id)
        if not student:
            continue
        enrollments = Enrollment.query.filter_by(student_id=student.id).all()
        avg_progress = sum(e.progress_percent for e in enrollments) / len(enrollments) if enrollments else 0
        total_time_result = db.session.query(func.sum(LessonProgress.time_spent_minutes)).filter_by(student_id=student.id).scalar()
        total_time_spent = int(total_time_result) if total_time_result else 0
        needs_attention = [Course.query.get(e.course_id).title for e in enrollments if e.progress_percent < 30 and Course.query.get(e.course_id)]
        result.append({
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "overallProgress": round(avg_progress),
            "totalTimeSpent": total_time_spent,
            "coursesNeedingAttention": needs_attention
        })
    return jsonify(result), 200

@mentor_bp.route('/students/<int:student_id>/dashboard', methods=['GET'])
@jwt_required()
@role_required('MENTOR')
def student_dashboard(student_id):
    mentor_id = current_user_id()
    if not MentorStudent.query.filter_by(mentor_id=mentor_id, student_id=student_id).first():
        return jsonify({"message": "Unauthorized to view this student"}), 403

    student = User.query.get_or_404(student_id)
    completed_lessons = LessonProgress.query.filter_by(student_id=student_id, status='COMPLETED').count()
    total_time_result = db.session.query(func.sum(LessonProgress.time_spent_minutes)).filter_by(student_id=student_id).scalar()
    total_time_spent = int(total_time_result) if total_time_result else 0
    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    average_progress = sum(e.progress_percent for e in enrollments) / len(enrollments) if enrollments else 0

    courses_data = []
    for enrollment in enrollments:
        course = Course.query.get(enrollment.course_id)
        if not course:
            continue
        total_lessons = Lesson.query.filter_by(course_id=course.id).count()
        completed = LessonProgress.query.join(Lesson).filter(
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

    recent_activity = ActivityEvent.query.filter_by(student_id=student_id).order_by(ActivityEvent.created_at.desc()).limit(20).all()
    return jsonify({
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
    }), 200
