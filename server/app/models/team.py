from datetime import datetime
from app.extensions import db

class Team(db.Model):
    __tablename__ = 'team'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    
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

class TeamInvite(db.Model):
    """Leader invites a friend to join"""
    __tablename__ = 'team_invite'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    
    sender_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False) # The Leader
    receiver_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False) # The Friend
    
    # Status: 'pending', 'accepted', 'rejected'
    status = db.Column(db.String(20), default='pending')
    message = db.Column(db.Text, nullable=True) # Why are you inviting them?
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

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