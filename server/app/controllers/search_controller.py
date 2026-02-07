from flask import jsonify, request, g
from sqlalchemy import or_
from app.models.user import User

def perform_search():
    search_term = request.args.get("q")
    if not search_term:
        return jsonify({"error": "Search query not provided"}), 400

    search_query = f"%{search_term}%"

    try:
        users = User.query.filter(
            User.id != g.user_id, # Don't show myself
            or_(
                User.full_name.ilike(search_query),
                User.email.ilike(search_query)
            )
        ).all()

        return jsonify([
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "profile_pic_url": user.profile_pic,
                "location": user.location
            }
            for user in users
        ]), 200

    except Exception as e:
        print("Search error:", e)
        return jsonify({"error": "Search failed"}), 500