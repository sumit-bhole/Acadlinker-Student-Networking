from flask import Blueprint
from app.middleware.auth_middleware import token_required

from app.controllers.post_controller import (
    create_new_post, 
    get_current_user_posts, # Note: Make sure this is still defined in your post_controller.py!
    get_home_feed_posts,
    delete_post,
    get_saved_posts,        # 🟢 ADDED
    toggle_like,            # 🟢 ADDED
    toggle_save             # 🟢 ADDED
)

posts_bp = Blueprint("posts", __name__, url_prefix='/api/posts')

# -------------------------------------------------
# Routes (All use @token_required)
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

# 🟢 ADDED: Get Saved Posts
@posts_bp.route("/saved", methods=["GET"])
@token_required
def saved_posts_route():
    return get_saved_posts()

# 🟢 ADDED: Toggle Like
@posts_bp.route("/<int:post_id>/like", methods=["POST"])
@token_required
def like_post_route(post_id):
    return toggle_like(post_id)

# 🟢 ADDED: Toggle Save (Bookmark)
@posts_bp.route("/<int:post_id>/save", methods=["POST"])
@token_required
def save_post_route(post_id):
    return toggle_save(post_id)

# Delete Post Route
@posts_bp.route("/<int:post_id>", methods=["DELETE"])
@token_required
def delete_post_route(post_id):
    return delete_post(post_id)