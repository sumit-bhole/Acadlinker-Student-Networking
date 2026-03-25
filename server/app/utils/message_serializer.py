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

    # 🟢 TIMEZONE FIX: Append 'Z' so React knows this is UTC time!
    timestamp_str = None
    if msg.timestamp:
        timestamp_str = msg.timestamp.isoformat()
        if not timestamp_str.endswith('Z') and '+' not in timestamp_str:
            timestamp_str += 'Z'

    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "timestamp": timestamp_str, # 👈 Updated to use the timezone-aware string
        "file_url": file_url,
        
        # This now correctly compares the message sender with the logged-in user
        "is_sender": msg.sender_id == current_user_id
    }