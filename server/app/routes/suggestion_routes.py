from flask import Blueprint
# 1. REMOVE: from flask_login import login_required
# 2. ADD: Import the correct middleware
from app.middleware.auth_middleware import token_required

from app.controllers.suggestion_controller import get_user_suggestions

# Prefix: /api/suggestions
suggestions_bp = Blueprint("suggestions", __name__, url_prefix='/api/suggestions')

@suggestions_bp.route("/", methods=["GET"])
@token_required  # <--- Now this will work because it is imported!
def suggestions_api():
    return get_user_suggestions()