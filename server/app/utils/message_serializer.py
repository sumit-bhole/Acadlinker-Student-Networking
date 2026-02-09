from flask import url_for, g
from app.models.message import Message

def serialize_message(msg: Message):
    file_url = None

    if msg.file_name:
        if msg.file_name.startswith("http"):
            file_url = msg.file_name
        else:
            file_url = url_for("static", filename=f"uploads/{msg.file_name}")

    # 🛠️ FIX: Use 'g.user_id' instead of 'current_user.id'
    # Your auth middleware stores the ID in 'g', not in flask_login.
    current_user_id = getattr(g, 'user_id', None)

    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "timestamp": msg.timestamp.isoformat() if msg.timestamp else None,
        "file_url": file_url,
        
        # This now correctly compares the message sender with the logged-in user
        "is_sender": msg.sender_id == current_user_id
    }