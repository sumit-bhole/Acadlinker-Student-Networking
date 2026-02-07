from datetime import datetime
from app.extensions import db

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text)
    file_name = db.Column(db.String(120))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
