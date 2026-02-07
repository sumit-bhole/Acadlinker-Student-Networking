from flask import Blueprint
from app.middleware.auth_middleware import token_required
from app.controllers.auth_controller import get_current_user_profile

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# We only need this one route now!
# The frontend calls this to get the user's "Real" database profile
@auth_bp.route('/status', methods=['GET'])
@token_required
def status():
    return get_current_user_profile()