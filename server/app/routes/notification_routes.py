from flask import Blueprint
# 1. REMOVE: from flask_login import login_required
# 2. ADD: Import your new Supabase middleware
from app.middleware.auth_middleware import token_required

from app.controllers.notification_controller import (
    get_notifications,
    get_unread_count,
    mark_as_read,
    delete_notification
)

notifications_bp = Blueprint(
    "notifications",
    __name__,
    url_prefix="/api/notifications"
)

@notifications_bp.route("/", methods=["GET"])
@token_required   # <--- USE THIS instead of @token_required
def notifications():
    return get_notifications()

@notifications_bp.route("/unread_count", methods=["GET"])
@token_required   # <--- USE THIS
def unread_count():
    return get_unread_count()

@notifications_bp.route("/mark_read/<int:notification_id>", methods=["PATCH"])
@token_required   # <--- USE THIS
def mark_read(notification_id):
    return mark_as_read(notification_id)

@notifications_bp.route("/delete/<int:notification_id>", methods=["DELETE"])
@token_required   # <--- USE THIS
def delete(notification_id):
    return delete_notification(notification_id)