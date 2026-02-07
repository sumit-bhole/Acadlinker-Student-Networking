from flask import jsonify, g
from app.extensions import db
from app.models.notification import Notification

def get_notifications():
    user_id = g.user_id

    notifications = (
        Notification.query
        .filter_by(user_id=user_id)
        .order_by(Notification.timestamp.desc())
        .all()
    )

    data = [
        {
            "id": n.id,
            "message": n.message,
            "link": n.link,
            "is_read": n.is_read,
            "timestamp": n.timestamp.isoformat()
        }
        for n in notifications
    ]

    # Mark as read immediately
    Notification.query.filter_by(
        user_id=user_id,
        is_read=False
    ).update({"is_read": True})

    db.session.commit()
    return jsonify(data), 200


def get_unread_count():
    count = Notification.query.filter_by(
        user_id=g.user_id,
        is_read=False
    ).count()

    return jsonify({"unread_count": count}), 200


def mark_as_read(notification_id):
    notif = Notification.query.get_or_404(notification_id)

    if notif.user_id != g.user_id:
        return jsonify({"error": "Unauthorized"}), 403

    notif.is_read = True
    db.session.commit()
    return jsonify({"message": "Read"}), 200


def delete_notification(notification_id):
    notif = Notification.query.get_or_404(notification_id)

    if notif.user_id != g.user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(notif)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200