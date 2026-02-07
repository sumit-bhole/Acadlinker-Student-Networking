from flask import url_for
from flask_login import current_user
from app.models.message import Message


def serialize_message(msg: Message):
    file_url = None

    if msg.file_name:
        if msg.file_name.startswith("http"):
            file_url = msg.file_name
        else:
            file_url = url_for("static", filename=f"uploads/{msg.file_name}")

    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "timestamp": msg.timestamp.isoformat(),
        "file_url": file_url,
        "is_sender": msg.sender_id == current_user.id
    }
