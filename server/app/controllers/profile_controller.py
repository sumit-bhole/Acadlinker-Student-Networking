import cloudinary.uploader
from flask import jsonify, request, g, url_for, current_app
from werkzeug.datastructures import FileStorage

from app.extensions import db
from app.models.user import User
from app.models.post import Post
from app.models.friend_request import FriendRequest

# -------------------------------------------------
# Helpers (Private)
# -------------------------------------------------
def _upload_image(file_storage, folder):
    if file_storage:
        try:
            print(f"☁️ Uploading {folder} to Cloudinary...")
            result = cloudinary.uploader.upload(
                file_storage,
                folder=folder,
                resource_type="image"
            )
            return result.get("secure_url")
        except Exception as e:
            print(f"❌ Cloudinary Error: {e}")
            return None
    return None

def _serialize_user(target_user, current_user_id):
    """
    Serialize User object with privacy & friendship logic
    """
    user_data = {
        "id": target_user.id,
        "full_name": target_user.full_name,
        "email": target_user.email,
        "mobile_no": target_user.mobile_no,
        "location": target_user.location,
        "description": target_user.description,
        "skills": target_user.skills,
        "education": target_user.education,
        "profile_pic_url": target_user.profile_pic,
        "cover_photo_url": target_user.cover_photo,
        "created_at": target_user.created_at.isoformat(),
        "role": getattr(target_user, 'role', 'User') # Safety fallback
    }

    # Friendship status logic
    is_friend = False
    if current_user_id:
        is_friend = (
            db.session.query(User)
            .filter(
                User.id == current_user_id,
                User.friends.any(id=target_user.id)
            )
            .first() is not None
        )

    request_sent = False
    if current_user_id:
        request_sent = (
            FriendRequest.query.filter_by(
                sender_id=current_user_id,
                receiver_id=target_user.id,
                status="pending"
            ).first() is not None
        )

    request_received = False
    if current_user_id:
        request_received = (
            FriendRequest.query.filter_by(
                sender_id=target_user.id,
                receiver_id=current_user_id,
                status="pending"
            ).first() is not None
        )

    user_data.update({
        "is_friend": is_friend,
        "request_sent": request_sent,
        "request_received": request_received
    })

    # Privacy: hide sensitive info for non-friends (unless it's your own profile)
    if current_user_id != target_user.id and not is_friend:
        user_data.pop("email", None)
        user_data.pop("mobile_no", None)

    return user_data

# ==========================================
#  NEW HELPER: Serialize Post (Shared Logic)
# ==========================================
def _serialize_post(post):
    """
    Ensures post data structure matches what Frontend expects (Home Feed style).
    """
    image_url = None
    if post.file_name:
        if post.file_name.startswith("http"):
            image_url = post.file_name
        else:
            # Generate full URL for local files
            image_url = url_for("static", filename=f"uploads/{post.file_name}", _external=True)

    user_data = {
        "id": post.user.id,
        "full_name": post.user.full_name,
        "profile_pic_url": post.user.profile_pic or "/default-profile.png"
    } if post.user else {
        "id": "unknown",
        "full_name": "Unknown User",
        "profile_pic_url": "/default-profile.png"
    }

    return {
        "id": post.id,
        "title": post.title,
        "description": post.description,
        "file_url": image_url,  # Matches Frontend expectations
        "created_at": post.timestamp.isoformat() if post.timestamp else None, # Matches Frontend
        "user": user_data # Includes user details for card header
    }

# -------------------------------------------------
# Controller Actions
# -------------------------------------------------
def get_user_profile(user_id):
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"message": "User not found"}), 404

    # Check for specific received request ID
    received_request = FriendRequest.query.filter_by(
        sender_id=target_user.id,
        receiver_id=g.user_id,
        status="pending"
    ).first()

    user_data = _serialize_user(target_user, g.user_id)
    if received_request:
        user_data["request_id"] = received_request.id

    return jsonify(user_data), 200

# ==========================================
#  UPDATED FUNCTION: get_profile_posts
# ==========================================
def get_profile_posts(user_id):
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"message": "User not found"}), 404

    posts = (
        Post.query.filter_by(user_id=target_user.id)
        .order_by(Post.timestamp.desc())
        .all()
    )

    # Use the new helper to return FULL details (User info + Correct Image URL)
    return jsonify([_serialize_post(p) for p in posts]), 200

def update_user_profile():
    # 1. Fetch User
    current_user = User.query.get(g.user_id)
    if not current_user:
        return jsonify({"message": "User not found"}), 404

    data = request.form

    # 3. EXPLICIT UPDATE LOGIC
    if "full_name" in data:
        current_user.full_name = data["full_name"]
    
    if "mobile_no" in data:
        current_user.mobile_no = data["mobile_no"]
        
    if "location" in data:
        current_user.location = data["location"]
        
    if "description" in data:
        current_user.description = data["description"]
        
    if "skills" in data:
        current_user.skills = data["skills"]
        
    if "education" in data:
        current_user.education = data["education"]

    # 4. Handle Images
    profile_pic = request.files.get("profile_pic")
    cover_photo = request.files.get("cover_photo")

    if profile_pic and isinstance(profile_pic, FileStorage) and profile_pic.filename:
        url = _upload_image(profile_pic, "profile_pics")
        if url: current_user.profile_pic = url

    if cover_photo and isinstance(cover_photo, FileStorage) and cover_photo.filename:
        url = _upload_image(cover_photo, "cover_photos")
        if url: current_user.cover_photo = url

    try:
        # 5. Commit and Refresh
        db.session.commit()
        db.session.refresh(current_user) 
        
        return jsonify({
            "message": "Profile updated successfully",
            "user": _serialize_user(current_user, g.user_id)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500