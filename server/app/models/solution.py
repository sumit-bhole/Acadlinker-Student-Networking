from datetime import datetime
from app.extensions import db

class Solution(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Links
    request_id = db.Column(db.Integer, db.ForeignKey('help_request.id'), nullable=False)
    solver_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    
    # The Answer
    content = db.Column(db.Text, nullable=False)
    code_snippet = db.Column(db.Text, nullable=True) # Optional specific code block
    
    # Logic
    is_accepted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Solution {self.id} for Request {self.request_id}>'