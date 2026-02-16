from datetime import datetime
from app.extensions import db

class Task(db.Model):
    __tablename__ = 'task'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Status Columns: 'todo', 'in_progress', 'done'
    status = db.Column(db.String(20), default='todo')
    
    # Assigned Member (Optional - task can be unassigned)
    assigned_to_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=True)
    
    due_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    assigned_to = db.relationship('User', backref='tasks')