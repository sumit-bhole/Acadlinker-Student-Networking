from datetime import datetime
from app.extensions import db

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    file_name = db.Column(db.String(300))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # ---------------------------------------------------------
    # 🆕 NEW FIELDS FOR HYBRID FEED & ENGAGEMENT
    # ---------------------------------------------------------
    # 🟢 High-performance counter (updated by SQL trigger, not Python!)
    likes_count = db.Column(db.Integer, default=0)

    # Relationships (Cascade deletes so if a post is deleted, its likes/saves disappear too)
    likes = db.relationship('Like', backref='post', lazy=True, cascade="all, delete-orphan")
    saved_by = db.relationship('SavedPost', backref='post', lazy=True, cascade="all, delete-orphan")
    # ---------------------------------------------------------

    user = db.relationship('User', backref='posts', lazy=True)

    def __repr__(self):
        return f'<Post {self.title}>'