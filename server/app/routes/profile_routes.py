from flask import Blueprint
from app.middleware.auth_middleware import token_required  # <--- NEW IMPORT
from app.controllers.profile_controller import (
    get_user_profile,
    get_profile_posts,
    update_user_profile
)

profile_bp = Blueprint("profile", __name__, url_prefix='/api/profile')

# -------------------------------------------------
# Routes
# -------------------------------------------------

# CHANGED: <int:user_id> -> <string:user_id>
@profile_bp.route("/<string:user_id>", methods=["GET"])
@token_required  # <--- CHANGED
def get_profile(user_id):
    return get_user_profile(user_id)

# CHANGED: <int:user_id> -> <string:user_id>
@profile_bp.route("/<string:user_id>/posts", methods=["GET"])
@token_required  # <--- CHANGED
def get_user_posts(user_id):
    return get_profile_posts(user_id)

@profile_bp.route("/edit", methods=["PUT", "PATCH"])
@token_required  # <--- CHANGED
def edit_profile():
    return update_user_profile()