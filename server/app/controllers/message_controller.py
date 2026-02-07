from flask import jsonify, request, g
from app.extensions import db
from app.models.user import User
from app.models.message import Message
from app.services.message_file_service import save_message_file
from app.utils.message_serializer import serialize_message

# -----------------------------------
# Get List of Friends (Chat Sidebar)
# -----------------------------------
def get_friends():
    current_user = User.query.get(g.user_id)
    if not current_user:
        return jsonify({"error": "User not found"}), 404
        
    friends = current_user.friends.all()

    friends_data = [
        {
            "id": friend.id,
            "username": getattr(friend, "full_name", "Unknown"),
            "profile_pic_url": getattr(friend, "profile_pic", None)
        }
        for friend in friends
    ]

    return jsonify(friends_data), 200


# -----------------------------------
# Get Chat History
# -----------------------------------
def get_chat_history(user_id):
    current_user = User.query.get(g.user_id)
    friend = User.query.get(user_id)
    
    if not friend:
        return jsonify({"error": "User not found"}), 404

    # Check friendship before showing chat
    if not current_user.friends.filter_by(id=friend.id).first():
        return jsonify({"error": "You can only chat with your friends."}), 403

    messages = Message.query.filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == friend.id)) |
        ((Message.sender_id == friend.id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.timestamp.asc()).all()

    return jsonify({
        "friend": {
            "id": friend.id,
            "username": friend.full_name,
            "profile_pic_url": getattr(friend, "profile_pic", None)
        },
        "messages": [serialize_message(msg) for msg in messages]
    }), 200


# -----------------------------------
# Send Message (Text / File)
# -----------------------------------
def send_message(user_id):
    current_user = User.query.get(g.user_id)
    friend = User.query.get(user_id)
    
    if not friend:
        return jsonify({"error": "User not found"}), 404

    if not current_user.friends.filter_by(id=friend.id).first():
        return jsonify({"error": "You can only chat with your friends."}), 403

    content = request.form.get("content")
    file_data = request.files.get("file")

    if not content and not file_data:
        return jsonify({"error": "Message content or file is required."}), 400

    file_name_or_url = None

    if file_data and file_data.filename:
        allowed_extensions = {"png", "jpg", "jpeg", "pdf", "doc", "docx"}
        # Fix: Helper to safely get extension
        ext = file_data.filename.rsplit(".", 1)[-1].lower() if "." in file_data.filename else ""

        if ext not in allowed_extensions:
            return jsonify({
                "error": "Invalid file type. Allowed: png, jpg, jpeg, pdf, doc, docx."
            }), 400

        try:
            file_name_or_url = save_message_file(file_data)
        except Exception as e:
            return jsonify({"error": f"File upload failed: {str(e)}"}), 500

    message = Message(
        sender_id=current_user.id,
        receiver_id=friend.id,
        content=content,
        file_name=file_name_or_url
    )

    db.session.add(message)
    db.session.commit()

    return jsonify(serialize_message(message)), 201