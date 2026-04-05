from datetime import datetime
from app.extensions import db

class UserRecommendation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # The user receiving the suggestion
    user_id = db.Column(db.String(36), db.ForeignKey('user.id', ondelete='CASCADE'), index=True, nullable=False)
    # The suggested user
    recommended_user_id = db.Column(db.String(36), db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    # The ML similarity score
    score = db.Column(db.Float, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Prevent duplicate recommendations
    __table_args__ = (db.UniqueConstraint('user_id', 'recommended_user_id', name='uq_user_recommendation'),)