from app.extensions import db

# User ↔ User (friends)
friendships = db.Table(
    'friendships',
    # Changed from db.Integer to db.String(36) to match Supabase UUIDs
    db.Column('user_id', db.String(36), db.ForeignKey('user.id'), primary_key=True),
    db.Column('friend_id', db.String(36), db.ForeignKey('user.id'), primary_key=True)
)