from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request


def current_user_id():
    """Return the authenticated user's integer id from the JWT subject."""
    return int(get_jwt_identity())


def current_claims():
    """Return custom JWT claims such as role and name."""
    return get_jwt()


def role_required(role):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('role') != role:
                return jsonify(msg="Admin privileges required" if role == 'ADMIN' else f"{role} privileges required"), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
