from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models import User, MentorStudent, Enrollment, LessonProgress, Course, Lesson
from app.utils import role_required

mentor_bp = Blueprint('mentor', __name__, url_prefix='/api/mentor')

@mentor_bp.route('/students', methods=['GET'])
@jwt_required()
@role_required('MENTOR')
def get_students():
    identity = get_jwt_identity()
    mentor_id = identity['id']
    
    mentor_students = MentorStudent.query.filter_by(mentor_id=mentor_id).all()
    
    result = []
    for ms in mentor_students:
        student = User.query.get(ms.student_id)
        
        # Calculate stats for each student
        enrollments = Enrollment.query.filter_by(student_id=student.id).all()
        avg_progress = sum(e.progress_percent for e in enrollments) / len(enrollments) if enrollments else 0
        
        total_time_result = db.session.query(func.sum(LessonProgress.time_spent_minutes)).filter_by(
            student_id=student.id
        ).scalar()
        total_time_spent = int(total_time_result) if total_time_result else 0
        
        needs_attention = [Course.query.get(e.course_id).title for e in enrollments if e.progress_percent < 30]
        
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
    # Security check: verify this student belongs to the mentor
    identity = get_jwt_identity()
    mentor_id = identity['id']
    
    if not MentorStudent.query.filter_by(mentor_id=mentor_id, student_id=student_id).first():
        return jsonify({"message": "Unauthorized to view this student"}), 403
        
    # Return same structure as student dashboard
    # For MVP we can just import the logic or replicate it simply
    # Replicating simply for isolation
    completed_lessons = LessonProgress.query.filter_by(student_id=student_id, status='COMPLETED').count()
    
    total_time_result = db.session.query(func.sum(LessonProgress.time_spent_minutes)).filter_by(student_id=student_id).scalar()
    total_time_spent = int(total_time_result) if total_time_result else 0

    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    average_progress = sum(e.progress_percent for e in enrollments) / len(enrollments) if enrollments else 0

    courses_data = []
    for enrollment in enrollments:
        course = Course.query.get(enrollment.course_id)
        courses_data.append({
            "id": course.id,
            "title": course.title,
            "progressPercent": enrollment.progress_percent
        })

    return jsonify({
        "completedLessons": completed_lessons,
        "totalTimeSpent": total_time_spent,
        "averageProgress": round(average_progress),
        "courses": courses_data
    }), 200
