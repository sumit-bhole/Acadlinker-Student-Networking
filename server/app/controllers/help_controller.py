import os
import secrets
import cloudinary.uploader
from flask import jsonify, request, g, current_app, url_for
from datetime import datetime, timedelta

from app.extensions import db
from app.models.user import User
from app.models.help_request import HelpRequest
from app.models.solution import Solution
from app.services.notification_service import notify

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def _save_help_file(file):
    """
    Handles Image Uploads (Matches Post Controller logic)
    """
    if current_app.config.get("UPLOAD_PROVIDER") == "cloudinary":
        upload_result = cloudinary.uploader.upload(
            file,
            folder="acadlinker/help_requests",
            resource_type="image"
        )
        return upload_result["secure_url"]

    random_hex = secrets.token_hex(8)
    _, ext = os.path.splitext(file.filename)
    filename = random_hex + ext
    upload_folder = os.path.join(current_app.root_path, "static", "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    file.save(os.path.join(upload_folder, filename))
    return filename

def _serialize_user_simple(user):
    """
    Standardized User Object for Cards
    """
    if not user:
        return {"id": "unknown", "full_name": "Unknown User", "profile_pic_url": "/default-profile.png"}
    
    return {
        "id": user.id,
        "full_name": user.full_name,
        "profile_pic_url": getattr(user, "profile_pic", "/default-profile.png"),
        "reputation": getattr(user, "reputation_points", 0)
    }

def _serialize_help_request(req):
    """
    Standardized Request Object (Handles Local vs Cloudinary URLs)
    """
    image_url = None
    if req.image_url:
        if req.image_url.startswith("http"):
            image_url = req.image_url
        else:
            image_url = url_for("static", filename=f"uploads/{req.image_url}", _external=True)

    author = User.query.get(req.user_id)

    return {
        "id": req.id,
        "title": req.title,
        "description": req.description,
        "github_link": req.github_link,
        "tags": req.tags.split(',') if req.tags else [],
        "reward": 10,
        "status": req.status,
        "image_url": image_url,
        "created_at": req.created_at.isoformat(),
        "author": _serialize_user_simple(author)
    }

# ----------------------------------------------------------------
# 1. CREATE A REQUEST (The "Ask" Ticket)
# ----------------------------------------------------------------
def create_help_request():
    user = User.query.get(g.user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    # 🛑 CONSTRAINT: Check for ANY open request (Status-based)
    existing_open_req = HelpRequest.query.filter_by(user_id=user.id, status='open').first()
    
    if existing_open_req:
        return jsonify({
            "message": "You already have an active Help Request. Please solve or close it before asking again.",
            "can_ask": False
        }), 403

    # ✅ USE request.form (for Multipart Data)
    title = request.form.get('title')
    description = request.form.get('description')
    tags = request.form.get('tags') # Expecting "python,react" string
    github_link = request.form.get('github_link') # Optional now
    
    # Validation: GitHub link is NOT required here anymore
    if not title or not description or not tags:
        return jsonify({"message": "Title, Description, and Tags are required."}), 400

    # ✅ USE request.files (for Image Upload) - STRICTLY REQUIRED NOW
    image_filename = None
    if "image" not in request.files or not request.files["image"].filename:
         return jsonify({"message": "An image/screenshot of the error is required."}), 400

    file = request.files["image"]
    allowed = {"png", "jpg", "jpeg", "webp"}
    if "." in file.filename and file.filename.rsplit(".", 1)[1].lower() in allowed:
        image_filename = _save_help_file(file)
    else:
        return jsonify({"message": "Invalid image format (png, jpg, jpeg, webp only)."}), 400

    # Create Request
    new_req = HelpRequest(
        user_id=user.id,
        title=title,
        description=description,
        github_link=github_link if github_link else "", # Save empty string if None
        tags=tags,
        image_url=image_filename
    )

    # Update User's timestamp (Optional now since we check status, but good for tracking)
    user.last_help_request_at = datetime.utcnow()

    db.session.add(new_req)
    db.session.commit()

    return jsonify({
        "message": "Help Request Posted!", 
        "request": _serialize_help_request(new_req)
    }), 201


# ----------------------------------------------------------------
# 2. GET FEED (The "Rescue Radar")
# ----------------------------------------------------------------
def get_help_feed():
    # Logic: Get requests that are OPEN and NOT created by me
    query = HelpRequest.query.filter(
        HelpRequest.status == 'open',
        HelpRequest.user_id != g.user_id
    )

    requests = query.order_by(HelpRequest.created_at.desc()).limit(20).all()

    # Use serializer for consistent data structure
    data = [_serialize_help_request(req) for req in requests]

    return jsonify(data), 200


# ----------------------------------------------------------------
# 3. GET SINGLE REQUEST DETAILS
# ----------------------------------------------------------------
def get_request_details(request_id):
    req = HelpRequest.query.get_or_404(request_id)
    
    # Get Solutions
    solutions = Solution.query.filter_by(request_id=req.id).order_by(Solution.is_accepted.desc()).all()
    
    solutions_data = []
    for sol in solutions:
        solver = User.query.get(sol.solver_id)
        solutions_data.append({
            "id": sol.id,
            "solver": _serialize_user_simple(solver),
            "content": sol.content,
            "is_accepted": sol.is_accepted,
            "created_at": sol.created_at.isoformat()
        })

    # Combine Request Data + Solutions
    response_data = _serialize_help_request(req)
    response_data["solutions"] = solutions_data
    response_data["is_owner"] = (req.user_id == g.user_id) # Frontend permission flag

    return jsonify(response_data), 200


# ----------------------------------------------------------------
# 4. POST A SOLUTION
# ----------------------------------------------------------------
def post_solution(request_id):
    req = HelpRequest.query.get_or_404(request_id)
    
    if req.status != 'open':
        return jsonify({"message": "This request is closed."}), 400
        
    if req.user_id == g.user_id:
        return jsonify({"message": "You cannot solve your own request."}), 400

    # Solutions are usually text-only, so JSON is fine here
    data = request.json
    content = data.get('content')
    
    if not content:
        return jsonify({"message": "Solution content is required"}), 400

    new_sol = Solution(
        request_id=req.id,
        solver_id=g.user_id,
        content=content
    )
    
    db.session.add(new_sol)
    db.session.commit()
    
    # Notify Asker
    asker = User.query.get(req.user_id)
    try:
        notify(asker, "Someone posted a solution to your problem!", f"/help/{req.id}")
    except:
        pass

    return jsonify({"message": "Solution posted!"}), 201


# ----------------------------------------------------------------
# 5. ACCEPT SOLUTION (The Reward Logic)
# ----------------------------------------------------------------
def accept_solution(solution_id):
    sol = Solution.query.get_or_404(solution_id)
    req = HelpRequest.query.get(sol.request_id)
    
    # Security: Only the Asker can accept
    if req.user_id != g.user_id:
        return jsonify({"message": "Unauthorized"}), 403
        
    if req.status == 'solved':
        return jsonify({"message": "Already solved"}), 400

    # 1. Update Solution
    sol.is_accepted = True
    
    # 2. Update Request
    req.status = 'solved'
    
    # 3. Give Points to Solver
    solver = User.query.get(sol.solver_id)
    solver.reputation_points = (solver.reputation_points or 0) + 10
    
    db.session.commit()
    
    # Notify Solver
    try:
        notify(solver, f"🎉 Solution Accepted! You earned +10 Reputation.", f"/help/{req.id}")
    except:
        pass

    return jsonify({"message": "Solution accepted! Points awarded."}), 200