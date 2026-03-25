from flask import Blueprint
# 1. REMOVE: from flask_login import login_required
# 2. ADD: Import your new Supabase middleware
from app.middleware.auth_middleware import token_required

from app.controllers.post_controller import (
    create_new_post, 
    get_current_user_posts, 
    get_home_feed_posts,
    delete_post # 🟢 ADDED: Imported the delete function
)

posts_bp = Blueprint("posts", __name__, url_prefix='/api/posts')

# -------------------------------------------------
# Routes (All use @token_required now)
# -------------------------------------------------

@posts_bp.route("/create", methods=["POST"])
@token_required
def create_post():
    return create_new_post()

@posts_bp.route("/my", methods=["GET"])
@token_required
def user_posts():
    return get_current_user_posts()

@posts_bp.route("/home", methods=["GET"])
@token_required
def home_feed():
    return get_home_feed_posts()

# 🟢 ADDED: Delete Post Route
@posts_bp.route("/<int:post_id>", methods=["DELETE"])
@token_required
def delete_post_route(post_id):
    return delete_post(post_id)