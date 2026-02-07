from app.extensions import db
from app.models.notification import Notification


def notify(user_id, message, link="/"):
    """
    Create a notification for a user.
    """
    notification = Notification(
        user_id=user_id,
        message=message,
        link=link,
        is_read=False
    )
    db.session.add(notification)
    db.session.commit()
    return notification
