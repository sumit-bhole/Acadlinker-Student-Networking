from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask import jsonify, g

from app.models.user import User

# ---------------------------------------------------
# GET SUGGESTIONS (Optimized & Excludes Friends)
# ---------------------------------------------------
def get_user_suggestions():
    current_user = User.query.get(g.user_id)
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    # 1. 🛡️ EXCLUDE CURRENT FRIENDS AND SELF
    # We grab the IDs from your existing current_user.friends relationship
    friend_ids = [friend.id for friend in current_user.friends]
    excluded_ids = set(friend_ids + [current_user.id])

    # 2. 🚀 FETCH ONLY STRANGERS
    # This prevents the algorithm from doing math on people you already know
    potential_users = User.query.filter(User.id.notin_(excluded_ids)).all()

    if not potential_users:
        return jsonify({"status": "success", "count": 0, "data": []}), 200

    # 3. PREPARE DATA (O(N) - Fast List Comprehension)
    current_user_str = f"{current_user.skills or ''} {current_user.location or ''}"
    
    corpus = []
    user_ids = []
    
    for u in potential_users:
        corpus.append(f"{u.skills or ''} {u.location or ''}")
        user_ids.append(u.id)

    # If nobody has data, return empty
    if not any(corpus) and not current_user_str.strip():
        return jsonify({"status": "success", "count": 0, "data": []}), 200

    # 4. FAST AI MATH
    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        all_text = [current_user_str] + corpus
        tfidf_matrix = vectorizer.fit_transform(all_text)

        # Compare Current User (Row 0) vs Everyone Else
        current_user_vector = tfidf_matrix[0:1]
        potential_users_vectors = tfidf_matrix[1:]

        # .flatten() converts the matrix into a simple list of scores
        similarities = cosine_similarity(current_user_vector, potential_users_vectors).flatten()

    except ValueError:
        return jsonify({"status": "success", "count": 0, "data": []}), 200

    # 5. FILTER & SORT
    suggestions = []
    for i, score in enumerate(similarities):
        if score >= 0.40: # Only suggest people with 40%+ match
            suggestions.append((user_ids[i], score))

    suggestions.sort(key=lambda x: x[1], reverse=True)
    top_ids = [s[0] for s in suggestions[:5]] # Keep top 5

    if not top_ids:
        return jsonify({"status": "success", "count": 0, "data": []}), 200

    # 6. RETURN FORMATTED DATA
    final_users = User.query.filter(User.id.in_(top_ids)).all()
    
    # Re-sort to match the AI's ranking (SQLAlchemy scrambles the order)
    final_users.sort(key=lambda u: top_ids.index(u.id))

    response = [
        {
            "id": u.id,
            "name": u.full_name,
            "email": u.email,
            "skills": u.skills,
            "location": u.location,
            "profile_image": getattr(u, "profile_pic", None)
        }
        for u in final_users
    ]

    return jsonify({
        "status": "success",
        "count": len(response),
        "data": response
    }), 200