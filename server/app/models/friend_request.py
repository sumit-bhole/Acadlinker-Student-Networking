from app.extensions import db

class FriendRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # MUST be String(36) to match Supabase UUIDs
    sender_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(10), default='pending')
