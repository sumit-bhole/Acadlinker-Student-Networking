from flask import jsonify, request, g
from app.extensions import db
from app.models.user import User
from app.models.friend_request import FriendRequest
from app.services.notification_service import notify

def send_friend_request(user_id): # user_id is the TARGET ID
    # 1. Fetch the logged-in user
    current_user = User.query.get(g.user_id)
    if not current_user:
        return jsonify({"message": "User not found"}), 404

    # 2. Fetch the target user (from URL string UUID)
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"message": "Target user not found"}), 404

    if target_user.id == current_user.id:
        return jsonify({"message": "You can't send a friend request to yourself."}), 400

    # Check if already friends
    if current_user.friends.filter_by(id=target_user.id).first():
        return jsonify({"message": "Already friends."}), 400

    # Check for existing request
    if FriendRequest.query.filter_by(
        sender_id=current_user.id,
        receiver_id=target_user.id,
        status='pending'
    ).first():
        return jsonify({"message": "Friend request already sent."}), 400

    req = FriendRequest(
        sender_id=current_user.id,
        receiver_id=target_user.id
    )
    db.session.add(req)
    db.session.commit()

    notify(
        target_user,
        f"{current_user.full_name} sent you a friend request.",
        "/friends/requests"
    )

    return jsonify({
        "message": "Friend request sent successfully.",
        "status": "requested"
    }), 200


def get_friend_requests():
    # Use g.user_id directly
    pending = FriendRequest.query.filter_by(
        receiver_id=g.user_id,
        status='pending'
    ).all()

    data = [
        {
            "id": req.id,
            "sender_id": req.sender.id,
            "sender_name": req.sender.full_name,
            "sender_profile": getattr(req.sender, "profile_pic", None),
            "status": req.status
        }
        for req in pending
    ]

    return jsonify(data), 200


def accept_friend_request(req_id):
    current_user = User.query.get(g.user_id)
    req = FriendRequest.query.get_or_404(req_id)

    if req.receiver_id != current_user.id:
        return jsonify({"message": "Unauthorized."}), 403

    req.status = 'accepted'
    
    # Add to friends list (both ways)
    current_user.friends.append(req.sender)
    req.sender.friends.append(current_user)
    
    db.session.commit()

    notify(
        req.sender,
        f"{current_user.full_name} accepted your friend request.",
        "/friends/list"
    )

    return jsonify({
        "message": "Friend request accepted.",
        "status": "accepted"
    }), 200


def reject_friend_request(req_id):
    req = FriendRequest.query.get_or_404(req_id)

    if req.receiver_id != g.user_id:
        return jsonify({"message": "Unauthorized."}), 403

    req.status = 'rejected'
    db.session.commit()

    return jsonify({
        "message": "Friend request rejected.",
        "status": "rejected"
    }), 200


def remove_friend(user_id):
    current_user = User.query.get(g.user_id)
    friend = User.query.get(user_id) # Using get() for UUID string
    
    if not friend:
        return jsonify({"message": "Friend not found."}), 404

    if friend not in current_user.friends:
        return jsonify({"message": "Not in your friends list."}), 400

    current_user.friends.remove(friend)
    friend.friends.remove(current_user)
    db.session.commit()

    return jsonify({
        "message": "Friend removed successfully.",
        "status": "removed"
    }), 200


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


def search_friends():
    query = request.args.get('q', '').strip()

    if not query:
        return jsonify([]), 200

    results = User.query.filter(
        User.id != g.user_id,
        (User.full_name.ilike(f'%{query}%')) |
        (User.skills.ilike(f'%{query}%'))
    ).all()

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