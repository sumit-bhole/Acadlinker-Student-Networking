from flask import Blueprint
# 1. ADD: Import the token middleware
from app.middleware.auth_middleware import token_required
from app.controllers.search_controller import perform_search

search_bp = Blueprint("search", __name__, url_prefix='/api')

# Route becomes: /api/search
@search_bp.route("/search", methods=["GET"])
@token_required  # <--- CRITICAL: This sets g.user_id for the controller
def search_users():
    return perform_search()