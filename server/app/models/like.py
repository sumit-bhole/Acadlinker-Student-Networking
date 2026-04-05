from datetime import datetime
from app.extensions import db

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Match Supabase UUID length
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 🟢 MAANG Standard: Prevent duplicate likes at the database level
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='uq_user_post_like'),)