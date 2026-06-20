from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils import role_required
# Optional analytics endpoints if needed separately
# Based on TASKS.md they could be merged into dashboard or separate

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
@role_required('STUDENT')
def summary():
    return jsonify({"message": "Analytics summary available in dashboard endpoint"}), 200

@analytics_bp.route('/time-series', methods=['GET'])
@jwt_required()
@role_required('STUDENT')
def time_series():
    return jsonify({"message": "Time series available in dashboard endpoint"}), 200
