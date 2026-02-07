from flask import Blueprint
# 1. REMOVE: from flask_login import login_required
# 2. ADD: Import the correct middleware
from app.middleware.auth_middleware import token_required

from app.controllers.friend_controller import (
    send_friend_request,
    get_friend_requests,
    accept_friend_request,
    reject_friend_request,
    remove_friend,
    list_friends,
    search_friends
)

friends_bp = Blueprint(
    "friends",
    __name__,
    url_prefix="/api/friends"
)

# ------------------------------------------------------------------
# Routes (All use @token_required now)
# ------------------------------------------------------------------

@friends_bp.route("/send/<string:user_id>", methods=["POST"])
@token_required
def send(user_id):
    return send_friend_request(user_id)


@friends_bp.route("/requests", methods=["GET"])
@token_required
def requests():
    return get_friend_requests()


# Request IDs are still Integers (from your model), so <int:req_id> is correct
@friends_bp.route("/accept/<int:req_id>", methods=["POST"])
@token_required
def accept(req_id):
    return accept_friend_request(req_id)


@friends_bp.route("/reject/<int:req_id>", methods=["POST"])
@token_required
def reject(req_id):
    return reject_friend_request(req_id)


@friends_bp.route("/remove/<string:user_id>", methods=["POST"])
@token_required
def remove(user_id):
    return remove_friend(user_id)


@friends_bp.route("/list", methods=["GET"])
@token_required
def list_all():
    return list_friends()


@friends_bp.route("/search", methods=["GET"])
@token_required
def search():
    return search_friends()