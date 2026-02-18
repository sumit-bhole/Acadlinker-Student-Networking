from datetime import datetime
from app.extensions import db

class TeamAIChat(db.Model):
    __tablename__ = 'team_ai_chat'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    
    content = db.Column(db.Text, nullable=False)
    is_bot = db.Column(db.Boolean, default=False) # True = AI, False = User
    
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)