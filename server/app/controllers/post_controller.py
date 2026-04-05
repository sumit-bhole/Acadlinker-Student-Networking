import os
import secrets
import cloudinary.uploader

from flask import jsonify, request, current_app, url_for, g
from sqlalchemy import or_, desc
from sqlalchemy.exc import IntegrityError # 🟢 ADDED: Required to prevent 500 crashes
from app.extensions import db
from app.models.post import Post
from app.models.user import User
from app.models.like import Like
from app.models.saved_post import SavedPost

# -------------------------------------------------
# MAANG OPTIMIZATION: Advanced Serializer
# -------------------------------------------------
def _serialize_post(post, is_liked=False, is_saved=False):
    """
    Serializes the post and attaches the highly-optimized boolean flags 
    (is_liked, is_saved) computed directly by PostgreSQL.
    """
    image_url = None
    if post.file_name and post.file_name.startswith("http"):
        image_url = post.file_name
    elif post.file_name:
        image_url = url_for("static", filename=f"uploads/{post.file_name}", _external=False)

    user_data = {
        "id": "unknown",
        "full_name": "Unknown User",
        "profile_pic_url": "/default-profile.png"
    }

    if post.user:
        user_data = {
            "id": post.user.id,
            "full_name": post.user.full_name,  
            "profile_pic_url": getattr(post.user, "profile_pic", None) 
        }

    timestamp_str = None
    if post.timestamp:
        timestamp_str = post.timestamp.isoformat()
        if not timestamp_str.endswith('Z') and '+' not in timestamp_str:
            timestamp_str += 'Z'

    return {
        "id": post.id,
        "title": post.title,
        "description": post.description,
        "file_url": image_url,
        "created_at": timestamp_str,
        "user": user_data,
        # 🟢 Bulletproof fallback: If it's None in the DB, send 0 to React
        "likes_count": post.likes_count if post.likes_count is not None else 0,
        "is_liked": is_liked,
        "is_saved": is_saved
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

    # 🟢 REQUIREMENT: Enforce Image Upload on the Backend
    file_name = None
    if "file" in request.files and request.files["file"].filename:
        file = request.files["file"]
        allowed_extensions = {"png", "jpg", "jpeg", "webp"}
        if "." not in file.filename or file.filename.rsplit(".", 1)[1].lower() not in allowed_extensions:
            return jsonify({"error": "File must be png, jpg, or jpeg"}), 400
        file_name = _save_post_file(file)
    else:
        return jsonify({"error": "An image is required to create a post"}), 400 # Strict validation

    post = Post(
        user_id=g.user_id,
        title=title,
        description=description,
        file_name=file_name
    )

    db.session.add(post)
    db.session.commit()
    db.session.refresh(post)
    
    return jsonify({
        "message": "Post created successfully",
        "post": _serialize_post(post, is_liked=False, is_saved=False)
    }), 201

# -------------------------------------------------
# Get Current User Posts (My Posts)
# -------------------------------------------------
def get_current_user_posts():
    # Use the same highly-optimized N+1 elimination query
    is_liked_subq = db.session.query(Like.id).filter(Like.post_id == Post.id, Like.user_id == g.user_id).exists()
    is_saved_subq = db.session.query(SavedPost.id).filter(SavedPost.post_id == Post.id, SavedPost.user_id == g.user_id).exists()

    posts_query = (
        db.session.query(
            Post,
            is_liked_subq.label('is_liked'),
            is_saved_subq.label('is_saved')
        )
        .filter(Post.user_id == g.user_id)
        .order_by(Post.timestamp.desc())
        .all()
    )

    return jsonify([_serialize_post(post, is_liked, is_saved) for post, is_liked, is_saved in posts_query]), 200


# -------------------------------------------------
# 🚀 MAANG OPTIMIZATION: The Hybrid Feed Algorithm
# -------------------------------------------------
def get_home_feed_posts():
    current_user = User.query.get(g.user_id)
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    page = request.args.get('page', 1, type=int)
    per_page = 20

    # 1. FRIEND POSTS
    friend_ids = [f.id for f in current_user.friends] + [current_user.id]
    q1 = db.session.query(Post.id).filter(Post.user_id.in_(friend_ids))

    # 2. SKILL POSTS
    q2 = None
    if current_user.skills:
        skills = [s.strip() for s in current_user.skills.split(',') if s.strip()]
        skill_filters = [
            or_(Post.title.ilike(f"%{s}%"), Post.description.ilike(f"%{s}%"))
            for s in skills
        ]
        if skill_filters:
            q2 = db.session.query(Post.id).filter(or_(*skill_filters))

    # 3. TRENDING POSTS 
    q3 = db.session.query(Post.id).order_by(
        Post.likes_count.desc(),
        Post.timestamp.desc()
    ).limit(100)

    # 4. RECENT POSTS 
    q4 = db.session.query(Post.id).order_by(Post.timestamp.desc()).limit(100)

    # COMBINE ALL
    combined_query = q1
    if q2:
        combined_query = combined_query.union(q2)
    combined_query = combined_query.union(q3).union(q4)

    # FINAL FETCH
    is_liked_subq = db.session.query(Like.id).filter(Like.post_id == Post.id, Like.user_id == g.user_id).exists()
    is_saved_subq = db.session.query(SavedPost.id).filter(SavedPost.post_id == Post.id, SavedPost.user_id == g.user_id).exists()

    posts_query = (
        db.session.query(
            Post,
            is_liked_subq.label('is_liked'),
            is_saved_subq.label('is_saved')
        )
        .filter(Post.id.in_(combined_query))
        .order_by(Post.timestamp.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return jsonify({
        "posts": [_serialize_post(post, is_liked, is_saved) for post, is_liked, is_saved in posts_query.items],
        "has_more": posts_query.has_next
    }), 200

# -------------------------------------------------
# 🟢 NEW: Saved Posts Feed
# -------------------------------------------------
def get_saved_posts():
    is_liked_subq = db.session.query(Like.id).filter(Like.post_id == Post.id, Like.user_id == g.user_id).exists()
    
    saved_posts_query = (
        db.session.query(
            Post,
            is_liked_subq.label('is_liked')
        )
        .join(SavedPost, SavedPost.post_id == Post.id)
        .filter(SavedPost.user_id == g.user_id)
        .order_by(SavedPost.created_at.desc())
        .all()
    )

    return jsonify([_serialize_post(post, is_liked, is_saved=True) for post, is_liked in saved_posts_query]), 200

# -------------------------------------------------
# 🟢 UPDATED: Toggle Like (Race-Condition Proof)
# -------------------------------------------------
def toggle_like(post_id):
    like = Like.query.filter_by(user_id=g.user_id, post_id=post_id).first()
    
    try:
        if like:
            db.session.delete(like)
            is_liked = False
            message = "Post unliked"
        else:
            new_like = Like(user_id=g.user_id, post_id=post_id)
            db.session.add(new_like)
            is_liked = True
            message = "Post liked"

        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        is_liked = not bool(like)
        message = "Action already processed"

    post = Post.query.get(post_id)
    
    return jsonify({
        "message": message,
        "is_liked": is_liked,
        "likes_count": post.likes_count if post and post.likes_count is not None else 0
    }), 200

# -------------------------------------------------
# 🟢 UPDATED: Toggle Save (Race-Condition Proof)
# -------------------------------------------------
def toggle_save(post_id):
    saved_post = SavedPost.query.filter_by(user_id=g.user_id, post_id=post_id).first()
    
    try:
        if saved_post:
            db.session.delete(saved_post)
            is_saved = False
            message = "Post removed from saved"
        else:
            new_save = SavedPost(user_id=g.user_id, post_id=post_id)
            db.session.add(new_save)
            is_saved = True
            message = "Post saved"

        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        is_saved = not bool(saved_post)
        message = "Action already processed"

    return jsonify({"message": message, "is_saved": is_saved}), 200

# -------------------------------------------------
# Delete Post Controller
# -------------------------------------------------
def delete_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
        
    if post.user_id != g.user_id:
        return jsonify({"error": "Unauthorized to delete this post"}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted successfully"}), 200