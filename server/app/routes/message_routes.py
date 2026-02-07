from flask import Blueprint
# 1. Import your new middleware
from app.middleware.auth_middleware import token_required

from app.controllers.message_controller import (
    get_friends,
    get_chat_history,
    send_message
)

# 2. Changed prefix from '/messages' to '/api/messages' for consistency
messages_bp = Blueprint("messages", __name__, url_prefix="/api/messages")

# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------

@messages_bp.route("/friends", methods=["GET"])
@token_required
def friends_list():
    return get_friends()


@messages_bp.route("/chat/<string:user_id>", methods=["GET"])
@token_required
def chat_history(user_id):
    return get_chat_history(user_id)


@messages_bp.route("/send/<string:user_id>", methods=["POST"])
@token_required
def send_msg(user_id):
    return send_message(user_id)