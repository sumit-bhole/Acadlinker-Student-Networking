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
# Get Chat History (🟢 UPDATED FOR PAGINATION)
# -----------------------------------
def get_chat_history(user_id):
    current_user = User.query.get(g.user_id)
    friend = User.query.get(user_id)
    
    if not friend:
        return jsonify({"error": "User not found"}), 404

    # Check friendship before showing chat
    if not current_user.friends.filter_by(id=friend.id).first():
        return jsonify({"error": "You can only chat with your friends."}), 403

    # 1. Get pagination parameters from the URL (default: page 1, 20 messages)
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)

    # 2. Query the database for ONLY this chunk of messages
    # We order by descending (newest first) to get the most recent messages for this page
    pagination = Message.query.filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == friend.id)) |
        ((Message.sender_id == friend.id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.timestamp.desc()).paginate(page=page, per_page=limit, error_out=False)

    messages = pagination.items

    # 3. REVERSE the chunk! 
    # Because we pulled the newest first, they are backwards for the UI. 
    # Reversing them puts the oldest at the top and newest at the bottom.
    messages.reverse()

    return jsonify({
        "friend": {
            "id": friend.id,
            "username": friend.full_name,
            "profile_pic_url": getattr(friend, "profile_pic", None)
        },
        "messages": [serialize_message(msg) for msg in messages],
        "has_more": pagination.has_next # Tells the frontend if more older messages exist
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

# -----------------------------------
# Delete / Unsend Message
# -----------------------------------
def delete_message(message_id):
    current_user_id = getattr(g, 'user_id', None)
    
    # Find the message
    message = Message.query.get(message_id)
    
    if not message:
        return jsonify({"error": "Message not found"}), 404
        
    # Security Check: Only the sender can delete their own message
    if message.sender_id != current_user_id:
        return jsonify({"error": "Unauthorized to delete this message"}), 403
        
    db.session.delete(message)
    db.session.commit()
    
    return jsonify({"success": "Message unsent successfully"}), 200