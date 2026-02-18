from datetime import datetime
from app.extensions import db

class Team(db.Model):
    __tablename__ = 'team'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)

    # 🆕 NEW FIELDS
    profile_pic = db.Column(db.String(255), nullable=True) # URL to image
    github_repo = db.Column(db.String(255), nullable=True) # e.g. "facebook/react"
    
    # 🔒 Privacy & Hiring Settings
    # 'public' (visible to all) or 'private' (invite only)
    privacy = db.Column(db.String(20), default='public') 
    
    # Hiring Status
    is_hiring = db.Column(db.Boolean, default=False)
    hiring_requirements = db.Column(db.Text, nullable=True) # e.g., "Need React Dev"
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Leader (Creator)
    creator_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)

    # Relationships
    members = db.relationship('TeamMember', backref='team', cascade="all, delete-orphan")
    tasks = db.relationship('Task', backref='team', cascade="all, delete-orphan")
    invites = db.relationship('TeamInvite', backref='team', cascade="all, delete-orphan")
    join_requests = db.relationship('JoinRequest', backref='team', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Team {self.name}>"

class TeamMember(db.Model):
    __tablename__ = 'team_member'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    
    # Role: 'leader' or 'member'
    role = db.Column(db.String(20), default='member')
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('team_id', 'user_id', name='_team_user_uc'),)

class TeamInvite(db.Model):
    """Leader invites a friend to join"""
    __tablename__ = 'team_invite'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    
    sender_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False) # The Leader
    receiver_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False) # The Friend
    
    # Status: 'pending', 'accepted', 'rejected'
    status = db.Column(db.String(20), default='pending')
    message = db.Column(db.Text, nullable=True) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 🟢 NEW: Add these relationships so 'inv.sender' works in the controller
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_team_invites')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_team_invites')

class JoinRequest(db.Model):
    """User requests to join a Public team"""
    __tablename__ = 'join_request'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    
    # Status: 'pending', 'accepted', 'rejected'
    status = db.Column(db.String(20), default='pending')
    message = db.Column(db.Text, nullable=True) # Pitch: Why should we hire you?
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ... (Keep existing Team, TeamMember, TeamInvite, JoinRequest classes)

class TeamMessage(db.Model):
    __tablename__ = 'team_message'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    sender_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = db.relationship('User', backref='team_messages')