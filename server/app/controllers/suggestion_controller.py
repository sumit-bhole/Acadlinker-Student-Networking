import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask import jsonify, g

from app.models.user import User

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def _generate_suggestions_logic(current_user, all_users, k=5):
    if not all_users:
        return []

    data = pd.DataFrame([
        {
            "id": u.id,
            "skills": u.skills or "",
            "location": u.location or ""
        }
        for u in all_users
    ])

    data["combined"] = data["skills"] + " " + data["location"]

    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        vectors = vectorizer.fit_transform(data["combined"])
        similarity_matrix = cosine_similarity(vectors)
    except ValueError:
        return []

    try:
        current_index = data.index[data["id"] == current_user.id][0]
    except IndexError:
        return []

    similarity_scores = list(enumerate(similarity_matrix[current_index]))
    similarity_scores.sort(key=lambda x: x[1], reverse=True)

    # CRITICAL FIX: Removed int() cast. ID is a string (UUID).
    top_user_ids = [
        data.iloc[i]["id"]
        for i, score in similarity_scores
        if data.iloc[i]["id"] != current_user.id and score >= 0.40
    ][:k]

    return top_user_ids

# -------------------------------------------------
# Controller Actions
# -------------------------------------------------
def get_user_suggestions():
    current_user = User.query.get(g.user_id)
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    all_users = User.query.all()
    suggested_ids = _generate_suggestions_logic(current_user, all_users)

    users = User.query.filter(User.id.in_(suggested_ids)).all()

    response = [
        {
            "id": u.id,
            "name": u.full_name,
            "email": u.email,
            "skills": u.skills,
            "location": u.location,
            "profile_image": u.profile_pic
        }
        for u in users
    ]

    return jsonify({
        "status": "success",
        "count": len(response),
        "data": response
    }), 200