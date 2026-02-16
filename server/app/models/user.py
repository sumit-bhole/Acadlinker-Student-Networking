from datetime import datetime
from app.extensions import db
from app.models.associations import friendships

class User(db.Model):
    # Supabase Auth IDs are UUID strings, not Integers
    id = db.Column(db.String(36), primary_key=True)
    
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=True)
    full_name = db.Column(db.String(100), nullable=False)
    
    mobile_no = db.Column(db.String(15))
    profile_pic = db.Column(db.String(500), default='default.jpg')
    cover_photo = db.Column(db.String(500), default='cover.jpg')
    location = db.Column(db.String(100))
    description = db.Column(db.Text)
    skills = db.Column(db.String(255))
    education = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # ---------------------------------------------------------
    # 🆕 NEW FIELDS FOR DEV-RESCUE (HELP FEATURE)
    # ---------------------------------------------------------
    reputation_points = db.Column(db.Integer, default=0)
    last_help_request_at = db.Column(db.DateTime, nullable=True)

    # 🆕 Relationships
    # Note: We use string names 'HelpRequest' and 'Solution' to avoid circular import errors
    help_requests = db.relationship('HelpRequest', backref='author', lazy=True)
    solutions = db.relationship('Solution', backref='solver', lazy=True)
    # ---------------------------------------------------------

    friends = db.relationship(
        'User',
        secondary=friendships,
        primaryjoin=(friendships.c.user_id == id),
        secondaryjoin=(friendships.c.friend_id == id),
        backref=db.backref('friend_of', lazy='dynamic'),
        lazy='dynamic'
    )

    # 🆕 Teams Relationship
    # accessing user.teams_membership will give list of TeamMember objects
    teams_membership = db.relationship('TeamMember', backref='user', lazy=True)

    def __repr__(self):
        # Accessing __dict__ reads the value directly from memory.
        # It avoids triggering a database refresh, preventing the loop.
        uid = self.__dict__.get("id", "unknown")
        return f"<User {uid}>"