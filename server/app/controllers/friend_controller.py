from flask import jsonify, request, g
from app.extensions import db
from app.models.user import User
from app.models.friend_request import FriendRequest
from app.services.notification_service import notify

# ---------------------------------------------------
# SEND REQUEST (With Reverse Check)
# ---------------------------------------------------
def send_friend_request(user_id):
    current_user = User.query.get(g.user_id)
    target_user = User.query.get(user_id)

    if not current_user or not target_user:
        return jsonify({"message": "User not found"}), 404

    if target_user.id == current_user.id:
        return jsonify({"message": "You can't send a request to yourself."}), 400

    # 1. Check if already friends
    if current_user.friends.filter_by(id=target_user.id).count() > 0:
        return jsonify({"message": "You are already friends."}), 400

    # 2. Check if YOU already sent a request (Pending or Rejected)
    existing_req = FriendRequest.query.filter_by(
        sender_id=current_user.id,
        receiver_id=target_user.id
    ).filter(FriendRequest.status.in_(['pending', 'rejected'])).first()
    
    if existing_req:
        if existing_req.status == 'pending':
            return jsonify({"message": "Request already sent."}), 400
        if existing_req.status == 'rejected':
            return jsonify({"message": "This user has rejected your previous request."}), 400

    # 3. 🛡️ Check if THEY already sent YOU a request
    reverse_req = FriendRequest.query.filter_by(
        sender_id=target_user.id,
        receiver_id=current_user.id,
        status='pending'
    ).first()

    if reverse_req:
        return jsonify({
            "message": "They already sent you a request! Check your inbox to accept it.",
            "status": "reverse_pending"
        }), 400

    # 4. Create the new request
    req = FriendRequest(
        sender_id=current_user.id,
        receiver_id=target_user.id,
        status='pending'
    )
    db.session.add(req)
    db.session.commit()

    try:
        notify(target_user, f"{current_user.full_name} sent you a friend request.", "/friends/requests")
    except Exception as e:
        print(f"⚠️ Notification failed: {e}")

    return jsonify({
        "message": "Friend request sent successfully.",
        "status": "requested"
    }), 200


# ---------------------------------------------------
# GET REQUESTS
# ---------------------------------------------------
def get_friend_requests():
    # Use g.user_id directly
    pending_requests = FriendRequest.query.filter_by(
        receiver_id=g.user_id,
        status='pending'
    ).all()

    data = []
    for req in pending_requests:
        # Manually fetch sender to avoid 'AttributeError'
        sender = User.query.get(req.sender_id)
        
        # Only add to list if sender still exists in database
        if sender:
            data.append({
                "id": req.id,
                "sender_id": sender.id,
                "sender_name": sender.full_name,
                "sender_profile": getattr(sender, "profile_pic", None),
                "status": req.status
            })

    return jsonify(data), 200


# ---------------------------------------------------
# ACCEPT REQUEST (Recursion Safe)
# ---------------------------------------------------
def accept_friend_request(req_id):
    try:
        current_user = User.query.get(g.user_id)
        req = FriendRequest.query.get(req_id)

        if not req or not current_user:
            return jsonify({"message": "Request or User not found"}), 404

        if req.receiver_id != current_user.id:
            return jsonify({"message": "Unauthorized"}), 403

        sender_user = User.query.get(req.sender_id)
        if not sender_user:
            db.session.delete(req)
            db.session.commit()
            return jsonify({"message": "Sender no longer exists."}), 404

        # Update Status
        req.status = 'accepted'
        
        # SAFELY Append Friends (Prevent Infinite Loop)
        if current_user.friends.filter_by(id=sender_user.id).count() == 0:
            current_user.friends.append(sender_user)
        
        if sender_user.friends.filter_by(id=current_user.id).count() == 0:
            sender_user.friends.append(current_user)
        
        db.session.commit()

        try:
            notify(
                sender_user,
                f"{current_user.full_name} accepted your friend request.",
                "/friends/list"
            )
        except Exception as e:
            print(f"⚠️ Notification failed: {e}")

        return jsonify({
            "message": "Friend request accepted.",
            "status": "accepted"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR in accept_friend_request: {str(e)}")
        return jsonify({'message': 'Server Error', 'error': str(e)}), 500


# ---------------------------------------------------
# REJECT REQUEST
# ---------------------------------------------------
def reject_friend_request(req_id):
    req = FriendRequest.query.get_or_404(req_id)

    if req.receiver_id != g.user_id:
        return jsonify({"message": "Unauthorized"}), 403

    req.status = 'rejected'
    db.session.commit()

    return jsonify({
        "message": "Friend request rejected.",
        "status": "rejected"
    }), 200


# ---------------------------------------------------
# REMOVE FRIEND
# ---------------------------------------------------
def remove_friend(user_id):
    current_user = User.query.get(g.user_id)
    friend = User.query.get(user_id) 
    
    if not friend:
        return jsonify({"message": "Friend not found."}), 404

    if current_user.friends.filter_by(id=friend.id).count() == 0:
        return jsonify({"message": "Not in your friends list."}), 400

    current_user.friends.remove(friend)
    friend.friends.remove(current_user)
    db.session.commit()

    return jsonify({
        "message": "Friend removed successfully.",
        "status": "removed"
    }), 200


# ---------------------------------------------------
# LIST FRIENDS
# ---------------------------------------------------
def list_friends():
    current_user = User.query.get(g.user_id)
    if not current_user:
        return jsonify({"message": "User not found"}), 404
        
    friends = current_user.friends.all()

    data = [
        {
            "id": f.id,
            "name": f.full_name,
            "email": f.email,
            "profile_image": getattr(f, "profile_pic", None)
        }
        for f in friends
    ]

    return jsonify(data), 200


# ---------------------------------------------------
# SEARCH FRIENDS
# ---------------------------------------------------
def search_friends():
    query = request.args.get('q', '').strip()

    if not query:
        return jsonify([]), 200

    results = User.query.filter(
        User.id != g.user_id,
        (User.full_name.ilike(f'%{query}%')) |
        (User.skills.ilike(f'%{query}%'))
    ).limit(20).all()

    users = [
        {
            "id": u.id,
            "name": u.full_name,
            "email": u.email,
            "skills": u.skills,
            "profile_image": getattr(u, "profile_pic", None)
        }
        for u in results
    ]

    return jsonify(users), 200