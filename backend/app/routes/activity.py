from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app import db
from app.models import ActivityEvent
from app.utils import current_user_id

activity_bp = Blueprint('activity', __name__, url_prefix='/api/activity')

@activity_bp.route('', methods=['GET'])
@jwt_required()
def get_activity():
    student_id = current_user_id()
    events = ActivityEvent.query.filter_by(student_id=student_id).order_by(ActivityEvent.created_at.desc()).limit(50).all()
    
    result = [{
        "id": e.id,
        "courseId": e.course_id,
        "lessonId": e.lesson_id,
        "type": e.type,
        "durationMinutes": e.duration_minutes,
        "createdAt": e.created_at.isoformat()
    } for e in events]
    return jsonify(result), 200

@activity_bp.route('', methods=['POST'])
@jwt_required()
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
