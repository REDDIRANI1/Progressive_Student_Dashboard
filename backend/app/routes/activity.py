from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app import db
from app.models import ActivityEvent
from app.utils import current_user_id, role_required

activity_bp = Blueprint('activity', __name__, url_prefix='/api/activity')

@activity_bp.route('', methods=['GET'])
@jwt_required()
@role_required('STUDENT')
def get_activity():
    student_id = current_user_id()
    events = ActivityEvent.query.filter_by(student_id=student_id).order_by(ActivityEvent.created_at.desc()).limit(50).all()
    return jsonify([{
        "id": event.id,
        "courseId": event.course_id,
        "lessonId": event.lesson_id,
        "type": event.type,
        "durationMinutes": event.duration_minutes,
        "createdAt": event.created_at.isoformat()
    } for event in events]), 200

@activity_bp.route('', methods=['POST'])
@jwt_required()
@role_required('STUDENT')
def post_activity():
    student_id = current_user_id()
    data = request.get_json()

    if not data or not data.get('type'):
        return jsonify({"message": "Missing event type"}), 400

    event = ActivityEvent(
        student_id=student_id,
        course_id=data.get('courseId'),
        lesson_id=data.get('lessonId'),
        type=data['type'],
        duration_minutes=data.get('durationMinutes', 0)
    )
    db.session.add(event)
    db.session.commit()

    return jsonify({"message": "Activity recorded"}), 201
