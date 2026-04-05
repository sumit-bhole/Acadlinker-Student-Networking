from flask import jsonify, g
from sqlalchemy.sql.expression import func
from app.extensions import db
from app.models.user import User
from app.models.recommendation import UserRecommendation

def get_user_suggestions():
    current_user = User.query.get(g.user_id)
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    # 1. 🚀 INSTANT O(1) LOOKUP FROM THE PRE-COMPUTED ML DATABASE
    # We join the User table to get the profile details instantly
    ml_recommendations = (
        db.session.query(User)
        .join(UserRecommendation, UserRecommendation.recommended_user_id == User.id)
        .filter(UserRecommendation.user_id == g.user_id)
        .order_by(UserRecommendation.score.desc())
        .limit(5)
        .all()
    )

    suggestions = list(ml_recommendations)

    # 2. 🛟 THE FALLBACK (Failsafe UX)
    # If the background ML hasn't finished, or they have no skills, fill with trending users
    if len(suggestions) < 5:
        needed = 5 - len(suggestions)
        
        friend_ids = [f.id for f in current_user.friends]
        exclude_ids = friend_ids + [current_user.id] + [u.id for u in suggestions]
        
        fallback_users = (
            User.query.filter(User.id.notin_(exclude_ids))
            .order_by(func.random()) # Fast random grab
            .limit(needed)
            .all()
        )
        suggestions.extend(fallback_users)

    # 3. Format Output
    response = [
        {
            "id": u.id,
            "name": u.full_name,
            "email": u.email,
            "skills": u.skills,
            "location": u.location,
            "profile_image": getattr(u, "profile_pic", None)
        }
        for u in suggestions
    ]

    return jsonify({
        "status": "success",
        "count": len(response),
        "data": response
    }), 200