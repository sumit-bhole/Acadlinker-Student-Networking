import os
import secrets
import cloudinary.uploader

from flask import jsonify, request, current_app, url_for, g
from app.extensions import db
from app.models.post import Post
from app.models.user import User

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def _serialize_post(post):
    image_url = None
    if post.file_name and post.file_name.startswith("http"):
        image_url = post.file_name
    elif post.file_name:
        image_url = url_for("static", filename=f"uploads/{post.file_name}", _external=False)

    return {
        "id": post.id,
        "title": post.title,
        "description": post.description,
        "file_url": image_url,
        "date_posted": post.timestamp.isoformat(),
        "user": {
            "id": post.user.id,
            "name": post.user.full_name,
            "profile_pic": getattr(post.user, "profile_pic", None)
        }
    }

def _save_post_file(file):
    if current_app.config.get("UPLOAD_PROVIDER") == "cloudinary":
        upload_result = cloudinary.uploader.upload(
            file,
            folder="acadlinker/posts"
        )
        return upload_result["secure_url"]

    random_hex = secrets.token_hex(8)
    _, ext = os.path.splitext(file.filename)
    filename = random_hex + ext
    upload_folder = os.path.join(current_app.root_path, "static", "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    file.save(os.path.join(upload_folder, filename))
    return filename

# -------------------------------------------------
# Controller Actions
# -------------------------------------------------
def create_new_post():
    title = request.form.get("title")
    description = request.form.get("description")

    if not title:
        return jsonify({"error": "Title is required"}), 400

    file_name = None
    if "file" in request.files and request.files["file"].filename:
        file = request.files["file"]
        allowed_extensions = {"png", "jpg", "jpeg"}
        if "." not in file.filename or file.filename.rsplit(".", 1)[1].lower() not in allowed_extensions:
            return jsonify({"error": "File must be png, jpg, or jpeg"}), 400
        file_name = _save_post_file(file)

    post = Post(
        user_id=g.user_id, # Using Token ID
        title=title,
        description=description,
        file_name=file_name
    )

    db.session.add(post)
    db.session.commit()
    
    # Reload to get relationships
    db.session.refresh(post)
    
    return jsonify({
        "message": "Post created successfully",
        "post": _serialize_post(post)
    }), 201

def get_current_user_posts():
    posts = (
        Post.query
        .filter_by(user_id=g.user_id) # Using Token ID
        .order_by(Post.timestamp.desc())
        .all()
    )
    return jsonify([_serialize_post(post) for post in posts]), 200

def get_home_feed_posts():
    # 1. Fetch current user to get their friends list
    current_user = User.query.get(g.user_id)
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    friend_ids = [friend.id for friend in current_user.friends]
    friend_ids.append(current_user.id) # Add self

    posts = (
        Post.query
        .filter(Post.user_id.in_(friend_ids))
        .order_by(Post.timestamp.desc())
        .all()
    )

    return jsonify([_serialize_post(post) for post in posts]), 200