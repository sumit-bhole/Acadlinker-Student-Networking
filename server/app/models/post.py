from datetime import datetime
from app.extensions import db

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # CHANGED: Integer -> String(36)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    file_name = db.Column(db.String(300))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    user = db.relationship('User', backref='posts', lazy=True)

    def __repr__(self):
        return f'<Post {self.title}>'