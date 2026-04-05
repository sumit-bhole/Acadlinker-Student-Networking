import threading
from flask import current_app
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.extensions import db
from app.models.user import User
from app.models.recommendation import UserRecommendation

def _run_ml_logic(app, user_id):
    """The actual heavy math function running in the background."""
    with app.app_context():
        try:
            target_user = User.query.get(user_id)
            if not target_user or not target_user.skills:
                return # No skills to compare

            # 1. Get all other users
            friend_ids = [f.id for f in target_user.friends]
            excluded_ids = set(friend_ids + [target_user.id])
            potential_users = User.query.filter(User.id.notin_(excluded_ids)).all()

            if not potential_users:
                return

            # 2. Prepare Data
            target_text = f"{target_user.skills or ''} {target_user.location or ''}"
            corpus = [f"{u.skills or ''} {u.location or ''}" for u in potential_users]
            user_ids = [u.id for u in potential_users]

            # 3. TF-IDF & Math
            vectorizer = TfidfVectorizer(stop_words="english")
            all_text = [target_text] + corpus
            tfidf_matrix = vectorizer.fit_transform(all_text)
            
            similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

            # 4. Filter Top 10 Matches (Threshold > 30% match)
            suggestions = []
            for i, score in enumerate(similarities):
                if score >= 0.30: 
                    suggestions.append({"id": user_ids[i], "score": float(score)})

            # Sort by highest score and keep top 10
            suggestions.sort(key=lambda x: x["score"], reverse=True)
            top_10 = suggestions[:10]

            if not top_10:
                return

            # 5. Database Transaction (Atomic replacement)
            # Delete old recommendations
            UserRecommendation.query.filter_by(user_id=user_id).delete()
            
            # Insert new ones
            for rec in top_10:
                new_rec = UserRecommendation(
                    user_id=user_id,
                    recommended_user_id=rec["id"],
                    score=rec["score"]
                )
                db.session.add(new_rec)
            
            db.session.commit()
            print(f"✅ ML Engine: Updated {len(top_10)} recommendations for {target_user.full_name}")

        except Exception as e:
            db.session.rollback()
            print(f"❌ ML Engine Error: {str(e)}")

def trigger_ml_update_for_user(user_id):
    """
    Spins up a silent background thread so the API response isn't delayed.
    This bypasses Render's timeout limits.
    """
    app = current_app._get_current_object()
    thread = threading.Thread(target=_run_ml_logic, args=(app, user_id))
    thread.start()