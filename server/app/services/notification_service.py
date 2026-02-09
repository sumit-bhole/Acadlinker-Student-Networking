from datetime import datetime
from app.extensions import db
from app.models.notification import Notification

def notify(user_or_id, message, link):
    """
    Creates a notification for a user.
    accepts: user_or_id -> Can be a User object OR a user_id string
    """
    try:
        # 🛠️ THE FIX: Extract the ID if a User object is passed
        if hasattr(user_or_id, 'id'):
            user_id = user_or_id.id
        else:
            user_id = user_or_id

        # Debug print to verify
        # print(f"🔔 Sending notification to: {user_id}")

        new_notification = Notification(
            user_id=user_id,
            message=message,
            link=link,
            is_read=False,
            timestamp=datetime.utcnow()
        )
        
        db.session.add(new_notification)
        db.session.commit()
        return True
        
    except Exception as e:
        # Print error but don't crash the app
        print(f"⚠️ Notification System Error: {e}")
        db.session.rollback()
        return False