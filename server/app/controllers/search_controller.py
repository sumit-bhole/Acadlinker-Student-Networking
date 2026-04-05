from flask import jsonify, request, g
from sqlalchemy import or_
from app.models.user import User

def perform_search():
    # 1. Strip whitespace
    search_term = request.args.get("q", "").strip()
    
    # 2. Prevent expensive DB calls for tiny queries
    if not search_term:
        return jsonify([]), 200

    search_query = f"%{search_term}%"

    try:
        # 3. MAANG FIX: Always LIMIT your search queries. 
        # Supabase free tier will timeout on full table scans eventually.
        users = User.query.filter(
            User.id != g.user_id,
            or_(
                User.full_name.ilike(search_query),
                User.email.ilike(search_query)
            )
        ).limit(25).all() # <-- CRITICAL: Caps RAM usage on Render

        return jsonify([
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "profile_pic_url": getattr(user, 'profile_pic', None),
                "location": getattr(user, 'location', None)
            }
            for user in users
        ]), 200

    except Exception as e:
        print("Search error:", e)
        return jsonify({"error": "Search failed"}), 500