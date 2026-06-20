from flask import Blueprint, request, jsonify
from app import db
from app.models import User
from flask_jwt_extended import create_access_token, jwt_required
from app.utils import current_user_id

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({"message": "Missing required fields"}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "User already exists"}), 409
        
    role = data.get('role', 'STUDENT')
    if role not in ['STUDENT', 'MENTOR']:
        return jsonify({"message": "Invalid role"}), 400
        
    user = User(name=data['name'], email=data['email'], role=role)
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Missing email or password"}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"message": "Invalid credentials"}), 401
        
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "name": user.name}
    )
    return jsonify({"access_token": access_token, "user": {"id": user.id, "email": user.email, "role": user.role, "name": user.name}}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user = User.query.get(current_user_id())
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({"id": user.id, "name": user.name, "email": user.email, "role": user.role}), 200
