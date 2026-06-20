import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()

def create_app():
    load_dotenv()
    
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key-change-me-32chars')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-jwt-secret-key-change-me-32chars')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)
    
    # Register models
    from app import models
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.courses import courses_bp
    from app.routes.lessons import lessons_bp
    from app.routes.mentor import mentor_bp
    from app.routes.export import export_bp
    from app.routes.analytics import analytics_bp
    from app.routes.activity import activity_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(courses_bp)
    app.register_blueprint(lessons_bp)
    app.register_blueprint(mentor_bp)
    app.register_blueprint(export_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(activity_bp)
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "ok", "message": "API is running"}), 200
        
    return app
