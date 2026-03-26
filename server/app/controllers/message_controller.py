from flask import jsonify, request, g
from app.extensions import db
from app.models.user import User
from app.models.message import Message
from app.services.message_file_service import save_message_file
from app.utils.message_serializer import serialize_message
from datetime import datetime

# -----------------------------------
# Get List of Friends (Chat Sidebar)
# -----------------------------------
def get_friends():
    current_user = User.query.get(g.user_id)
    if not current_user:
        return jsonify({"error": "User not found"}), 404
        
    friends = current_user.friends.all()
    friends_data = []

    for friend in friends:
        # 1. 🟢 FIX: Order by ID instead of timestamp. 
        # This guarantees we get the newest message even if timestamps glitch out.
        latest_msg = Message.query.filter(
            ((Message.sender_id == current_user.id) & (Message.receiver_id == friend.id)) |
            ((Message.sender_id == friend.id) & (Message.receiver_id == current_user.id))
        ).order_by(Message.id.desc()).first()

        # 2. 🟢 FIX: Removed try/except block so it calculates perfectly
        unread_count = Message.query.filter(
            Message.sender_id == friend.id,
            Message.receiver_id == current_user.id,
            Message.is_read == False
        ).count()

        sort_id = 0
        last_msg_text = ""
        formatted_time = None

        if latest_msg:
            sort_id = latest_msg.id # We use ID for flawless sorting now
            
            # Format the text preview
            if latest_msg.content:
                last_msg_text = latest_msg.content
            elif latest_msg.file_name:
                last_msg_text = "📷 Attachment"

            # Format the time for React
            if latest_msg.timestamp:
                formatted_time = latest_msg.timestamp.isoformat()
                if not formatted_time.endswith('Z') and '+' not in formatted_time:
                    formatted_time += 'Z'

        friends_data.append({
            "id": friend.id,
            "username": getattr(friend, "full_name", "Unknown"),
            "profile_pic_url": getattr(friend, "profile_pic", None),
            "sort_id": sort_id, 
            "last_message": last_msg_text,
            "last_message_time": formatted_time,
            "unread_count": unread_count
        })

    # Sort descending so newest chats sit at the top
    friends_data.sort(key=lambda x: x["sort_id"], reverse=True)

    # Clean up JSON payload
    for f in friends_data:
        del f["sort_id"]

    return jsonify(friends_data), 200


# -----------------------------------
# Get Chat History 
# -----------------------------------
def get_chat_history(user_id):
    current_user = User.query.get(g.user_id)
    friend = User.query.get(user_id)
    
    if not friend:
        return jsonify({"error": "User not found"}), 404

    if not current_user.friends.filter_by(id=friend.id).first():
        return jsonify({"error": "You can only chat with your friends."}), 403

    # 🟢 NEW: Mark all unread messages from this friend as READ
    unread_messages = Message.query.filter(
        Message.sender_id == friend.id,
        Message.receiver_id == current_user.id,
        Message.is_read == False
    ).all()

    if unread_messages:
        for msg in unread_messages:
            msg.is_read = True
        db.session.commit()

    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)

    pagination = Message.query.filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == friend.id)) |
        ((Message.sender_id == friend.id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.timestamp.desc()).paginate(page=page, per_page=limit, error_out=False)

    messages = pagination.items
    messages.reverse()

    return jsonify({
        "friend": {
            "id": friend.id,
            "username": friend.full_name,
            "profile_pic_url": getattr(friend, "profile_pic", None)
        },
        "messages": [serialize_message(msg) for msg in messages],
        "has_more": pagination.has_next 
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
        # is_read defaults to False automatically!
    )

    db.session.add(message)
    db.session.commit()

    return jsonify(serialize_message(message)), 201


# -----------------------------------
# Delete / Unsend Message
# -----------------------------------
def delete_message(message_id):
    current_user_id = getattr(g, 'user_id', None)
    
    message = Message.query.get(message_id)
    
    if not message:
        return jsonify({"error": "Message not found"}), 404
        
    if message.sender_id != current_user_id:
        return jsonify({"error": "Unauthorized to delete this message"}), 403
        
    db.session.delete(message)
    db.session.commit()
    
    return jsonify({"success": "Message unsent successfully"}), 200