from flask import jsonify, g
from app.models.user import User

def get_current_user_profile():
    """
    Fetch the user's profile from the database using the ID 
    verified by the token_required middleware.
    """
    # g.user_id comes from the middleware
    user = User.query.filter_by(id=g.user_id).first()

    if not user:
        return jsonify({'message': 'User profile not found in database.'}), 404

    return jsonify({
        'is_logged_in': True,
        'user': {
            "id": user.id,
            "full_name": user.full_name,
            "username": user.username,
            "email": user.email,
            "profile_pic": user.profile_pic,
            "mobile_no": user.mobile_no,
            # Add other profile fields as needed
        }
    }), 200