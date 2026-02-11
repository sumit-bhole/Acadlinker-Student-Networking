from flask import Blueprint
from app.middleware.auth_middleware import token_required
from app.controllers.help_controller import (
    create_help_request,
    get_help_feed,
    get_request_details,
    post_solution,
    accept_solution
)

# ✅ URL Prefix defined here
help_bp = Blueprint('help', __name__, url_prefix='/api/help')

# -------------------------------------------------
# Routes
# -------------------------------------------------

@help_bp.route('/request', methods=['POST'])
@token_required
def create():
    """Create a new help request"""
    return create_help_request()

@help_bp.route('/feed', methods=['GET'])
@token_required
def feed():
    """Get the feed of open help requests"""
    return get_help_feed()

@help_bp.route('/<int:request_id>', methods=['GET'])
@token_required
def details(request_id):
    """Get details for a specific request"""
    return get_request_details(request_id)

@help_bp.route('/<int:request_id>/solve', methods=['POST'])
@token_required
def solve(request_id):
    """Post a solution"""
    return post_solution(request_id)

@help_bp.route('/solution/<int:solution_id>/accept', methods=['POST'])
@token_required
def accept(solution_id):
    """Accept a solution"""
    return accept_solution(solution_id)