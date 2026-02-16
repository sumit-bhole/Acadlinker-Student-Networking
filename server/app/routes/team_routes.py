from flask import Blueprint
from app.middleware.auth_middleware import token_required
from app.controllers.team_controller import (
    create_new_team,
    get_public_teams,
    get_my_teams,
    get_team_details,
    request_to_join_team,
    invite_friend_to_team,
    respond_to_join_request,
    get_team_chat, 
    send_team_message
)

team_bp = Blueprint('team', __name__, url_prefix='/api/teams')

@team_bp.route('/create', methods=['POST'])
@token_required
def create():
    return create_new_team()

@team_bp.route('/', methods=['GET'])
@token_required
def get_all():
    return get_public_teams()

@team_bp.route('/my', methods=['GET'])
@token_required
def get_mine():
    return get_my_teams()

@team_bp.route('/<int:team_id>', methods=['GET'])
@token_required
def get_details(team_id):
    return get_team_details(team_id)

@team_bp.route('/join-request', methods=['POST'])
@token_required
def join_request():
    return request_to_join_team()

@team_bp.route('/invite', methods=['POST'])
@token_required
def invite():
    return invite_friend_to_team()

@team_bp.route('/respond-request', methods=['POST'])
@token_required
def respond():
    return respond_to_join_request()

@team_bp.route('/<int:team_id>/chat', methods=['GET'])
@token_required
def get_chat(team_id):
    return get_team_chat(team_id)

@team_bp.route('/<int:team_id>/chat', methods=['POST'])
@token_required
def send_chat(team_id):
    return send_team_message(team_id)