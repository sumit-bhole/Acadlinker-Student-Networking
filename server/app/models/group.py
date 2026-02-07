from app.extensions import db
from app.models.associations import group_members

class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    
    # CHANGED: Integer -> String(36)
    creator_id = db.Column(db.String(36), db.ForeignKey('user.id'))

    members = db.relationship(
        'User',
        secondary=group_members,
        backref='groups'
    )

class GroupInvite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'))
    
    # CHANGED: Integer -> String(36)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'))
    
    status = db.Column(db.String(10), default='pending')