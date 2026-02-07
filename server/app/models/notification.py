from datetime import datetime
from app.extensions import db

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # CHANGED: Integer -> String(36)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    
    message = db.Column(db.String(255), nullable=False)
    link = db.Column(db.String(255))
    is_read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)