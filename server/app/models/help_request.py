from datetime import datetime
from app.extensions import db

class HelpRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # The Constraints
    github_link = db.Column(db.String(500), nullable=False)
    image_url = db.Column(db.String(500), nullable=True) # Optional screenshot
    
    # Tags are crucial for matching (stored as "python,react,sql")
    tags = db.Column(db.String(200), nullable=False)
    
    # Status: 'open', 'solved', 'closed'
    status = db.Column(db.String(20), default='open')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to solutions
    solutions = db.relationship('Solution', backref='request', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<HelpRequest {self.title}>'