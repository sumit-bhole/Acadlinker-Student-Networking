from flask import jsonify, request, g
from app.extensions import db
from app.models.team import Team, TeamMember, TeamInvite, JoinRequest
from app.models.user import User
# ... (Keep existing imports and functions)
from app.models.team import TeamMessage # <--- Make sure to import TeamMessage
from app.models.task import Task # Ensure Task is imported

def get_team_chat(team_id):
    # Check membership
    if not _get_membership(team_id, g.user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    messages = TeamMessage.query.filter_by(team_id=team_id).order_by(TeamMessage.timestamp.asc()).all()
    
    output = []
    for msg in messages:
        output.append({
            'id': msg.id,
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat(),
            'sender': {
                'id': msg.sender.id,
                'full_name': msg.sender.full_name,
                'profile_pic': msg.sender.profile_pic
            },
            'is_me': msg.sender_id == g.user_id
        })
    return jsonify(output), 200
# In app/controllers/team_controller.py

def send_team_message(team_id):
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return jsonify({'error': 'Message cannot be empty'}), 400
        
    if not _get_membership(team_id, g.user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    msg = TeamMessage(
        team_id=team_id,
        sender_id=g.user_id,
        content=content
    )
    db.session.add(msg)
    db.session.commit()
    
    # 🟢 FIX: Fetch the user explicitly using g.user_id
    current_user = User.query.get(g.user_id)
    
    return jsonify({
        'id': msg.id,
        'content': msg.content,
        'timestamp': msg.timestamp.isoformat(),
        'sender': {
            'id': current_user.id,
            'full_name': current_user.full_name,
            'profile_pic': current_user.profile_pic
        },
        'is_me': True
    }), 201
# -------------------------------------------------
# Helpers (Private)
# -------------------------------------------------
def _serialize_team(team):
    """Format team object for JSON response"""
    return {
        'id': team.id,
        'name': team.name,
        'description': team.description,
        'privacy': team.privacy,
        'is_hiring': team.is_hiring,
        'hiring_requirements': team.hiring_requirements,
        'creator_id': team.creator_id,
        'created_at': team.created_at.isoformat(),
        'member_count': len(team.members),
        'profile_pic': team.profile_pic,
        'github_repo': team.github_repo
    }

def _get_membership(team_id, user_id):
    """Check if user is a member of the team"""
    return TeamMember.query.filter_by(team_id=team_id, user_id=user_id).first()

# -------------------------------------------------
# Controller Actions
# -------------------------------------------------

def create_new_team():
    data = request.get_json()
    name = data.get('name')
    
    if not name:
        return jsonify({'error': 'Team name is required'}), 400

    try:
        new_team = Team(
            name=name,
            description=data.get('description'),
            privacy=data.get('privacy', 'public'),
            is_hiring=data.get('is_hiring', False),
            hiring_requirements=data.get('hiring_requirements', ''),
            creator_id=g.user_id,
            profile_pic=data.get('profile_pic'),
            github_repo=data.get('github_repo')
        )
        db.session.add(new_team)
        db.session.commit()

        # Add Creator as 'leader'
        leader = TeamMember(team_id=new_team.id, user_id=g.user_id, role='leader')
        db.session.add(leader)
        db.session.commit()

        return jsonify({'message': 'Team created successfully!', 'team': _serialize_team(new_team)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# 2. Add Edit Logic (NEW)
def edit_team(team_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({'error': 'Team not found'}), 404
        
    # Check permissions (Only Leader)
    membership = _get_membership(team.id, g.user_id)
    if not membership or membership.role != 'leader':
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json()
    
    # Update fields if provided
    if 'name' in data: team.name = data['name']
    if 'description' in data: team.description = data['description']
    if 'privacy' in data: team.privacy = data['privacy']
    if 'is_hiring' in data: team.is_hiring = data['is_hiring']
    if 'hiring_requirements' in data: team.hiring_requirements = data['hiring_requirements']
    if 'profile_pic' in data: team.profile_pic = data['profile_pic']
    if 'github_repo' in data: team.github_repo = data['github_repo']
    
    db.session.commit()
    return jsonify({'message': 'Team updated', 'team': _serialize_team(team)}), 200


def get_public_teams():
    # Fetch all public teams
    teams = Team.query.filter_by(privacy='public').all()
    return jsonify([_serialize_team(t) for t in teams]), 200

def get_my_teams():
    # Fetch teams where current user is a member
    memberships = TeamMember.query.filter_by(user_id=g.user_id).all()
    
    output = []
    for m in memberships:
        team_data = _serialize_team(m.team)
        team_data['my_role'] = m.role  # Add user's specific role
        output.append(team_data)
        
    return jsonify(output), 200
def get_team_details(team_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({'error': 'Team not found'}), 404

    membership = _get_membership(team.id, g.user_id)
    is_member = membership is not None
    is_leader = membership and membership.role == 'leader'
    
    # Privacy Guard
    if team.privacy == 'private' and not is_member:
        return jsonify({'error': 'Access denied. This is a private team.'}), 403

    # 1. Serialize Members
    members_data = []
    for m in team.members:
        user = User.query.get(m.user_id)
        if user:
            members_data.append({
                'user_id': user.id,
                'full_name': user.full_name,
                'profile_pic': user.profile_pic,
                'role': m.role,
                'joined_at': m.joined_at.isoformat()
            })

    # 2. Serialize Pending Join Requests (Only for Leaders)
    requests_data = []
    if is_leader:
        pending_reqs = JoinRequest.query.filter_by(team_id=team.id, status='pending').all()
        for req in pending_reqs:
            requester = User.query.get(req.user_id)
            requests_data.append({
                'id': req.id,
                'user_id': req.user_id,
                'full_name': requester.full_name,
                'profile_pic': requester.profile_pic,
                'message': req.message,
                'created_at': req.created_at.isoformat()
            })

    # 3. Serialize Recent Pending Tasks (Top 3)
    tasks_data = []
    if is_member:
        # Fetch pending/in-progress tasks
        recent_tasks = Task.query.filter_by(team_id=team.id).filter(Task.status != 'done').order_by(Task.due_date.asc()).limit(3).all()
        for t in recent_tasks:
            tasks_data.append({
                'id': t.id,
                'title': t.title,
                'priority': t.priority, # 'high', 'medium', 'low'
                'status': t.status
            })

    # 4. 🆕 Serialize Pending Invites (IDs only)
    # This allows the UI to show "Sent" instead of "Invite" for users already invited
    pending_invite_ids = []
    if is_leader:
        sent_invites = TeamInvite.query.filter_by(team_id=team.id, status='pending').all()
        pending_invite_ids = [inv.receiver_id for inv in sent_invites]

    response = _serialize_team(team)
    response['members'] = members_data
    response['join_requests'] = requests_data
    response['pending_tasks'] = tasks_data
    response['pending_invite_ids'] = pending_invite_ids # 👈 Added field
    response['is_member'] = is_member
    response['my_role'] = membership.role if is_member else None
    
    return jsonify(response), 200

def request_to_join_team():
    data = request.get_json()
    team_id = data.get('team_id')
    message = data.get('message', '')

    team = Team.query.get(team_id)
    if not team:
        return jsonify({'error': 'Team not found'}), 404

    if team.privacy == 'private':
        return jsonify({'error': 'Cannot request to join private team'}), 403

    if _get_membership(team_id, g.user_id):
        return jsonify({'error': 'Already a member'}), 400

    # Check existing request
    existing = JoinRequest.query.filter_by(team_id=team_id, user_id=g.user_id, status='pending').first()
    if existing:
        return jsonify({'error': 'Request already pending'}), 400

    join_req = JoinRequest(team_id=team_id, user_id=g.user_id, message=message)
    db.session.add(join_req)
    db.session.commit()

    return jsonify({'message': 'Join request sent successfully'}), 200

def invite_friend_to_team():
    data = request.get_json()
    team_id = data.get('team_id')
    friend_id = data.get('friend_id')
    message = data.get('message', '')

    # Permission Check
    membership = _get_membership(team_id, g.user_id)
    if not membership or membership.role != 'leader':
        return jsonify({'error': 'Only leaders can invite'}), 403

    if _get_membership(team_id, friend_id):
        return jsonify({'error': 'User already in team'}), 400

    invite = TeamInvite(
        team_id=team_id, 
        sender_id=g.user_id, 
        receiver_id=friend_id, 
        message=message
    )
    db.session.add(invite)
    db.session.commit()

    return jsonify({'message': 'Invite sent'}), 200

def respond_to_join_request():
    """Accept or Reject a user's request"""
    data = request.get_json()
    request_id = data.get('request_id')
    action = data.get('action') # 'accept' or 'reject'

    req = JoinRequest.query.get(request_id)
    if not req:
        return jsonify({'error': 'Request not found'}), 404

    # Verify Leader Permission
    membership = _get_membership(req.team_id, g.user_id)
    if not membership or membership.role != 'leader':
        return jsonify({'error': 'Unauthorized'}), 403

    if action == 'accept':
        req.status = 'accepted'
        new_member = TeamMember(team_id=req.team_id, user_id=req.user_id, role='member')
        db.session.add(new_member)
    else:
        req.status = 'rejected'

    db.session.commit()
    return jsonify({'message': f'Request {action}ed'}), 200

def get_my_invites():
    # 1. GET INVITES RECEIVED (Where I am the receiver)
    # We only care about 'pending' ones for the dashboard
    received_invites = TeamInvite.query.filter_by(receiver_id=g.user_id, status='pending').all()
    
    # 2. GET REQUESTS SENT (Where I am the sender)
    # We want to see all statuses (pending/accepted/rejected) to track progress
    sent_requests = JoinRequest.query.filter_by(user_id=g.user_id).order_by(JoinRequest.created_at.desc()).all()

    return jsonify({
        'received_invites': [{
            'id': inv.id,
            'team_name': inv.team.name,
            'sender_name': inv.sender.full_name, # Assuming User model has full_name
            'message': inv.message,
            'sent_at': inv.created_at.isoformat()
        } for inv in received_invites],
        
        'sent_requests': [{
            'id': req.id,
            'team_name': req.team.name,
            'status': req.status, # 'pending', 'accepted', 'rejected'
            'sent_at': req.created_at.isoformat()
        } for req in sent_requests]
    }), 200

# Function to Respond to an Invite (Accept/Reject)
def respond_to_invite():
    data = request.get_json()
    invite_id = data.get('invite_id')
    action = data.get('action') # 'accept' or 'reject'

    invite = TeamInvite.query.get(invite_id)
    if not invite or invite.receiver_id != g.user_id:
        return jsonify({'error': 'Invite not found or unauthorized'}), 404

    if action == 'accept':
        invite.status = 'accepted'
        # Add user to the team members table
        new_member = TeamMember(team_id=invite.team_id, user_id=g.user_id, role='member')
        db.session.add(new_member)
    else:
        invite.status = 'rejected'

    db.session.commit()
    return jsonify({'message': f'Invite {action}ed'}), 200

# app/controllers/team_controller.py

def remove_team_member(team_id, user_id):
    """Remove a member from the team (Kick)"""
    
    # 1. Verify Requester is Leader
    requester_membership = _get_membership(team_id, g.user_id)
    if not requester_membership or requester_membership.role != 'leader':
        return jsonify({'error': 'Only leaders can remove members'}), 403

    # 2. Prevent removing yourself (Leader cannot kick self, must leave instead)
    if str(g.user_id) == str(user_id):
        return jsonify({'error': 'You cannot remove yourself. Delete the team instead.'}), 400

    # 3. Find the member to remove
    member_to_remove = TeamMember.query.filter_by(team_id=team_id, user_id=user_id).first()
    if not member_to_remove:
        return jsonify({'error': 'Member not found'}), 404

    try:
        db.session.delete(member_to_remove)
        db.session.commit()
        return jsonify({'message': 'Member removed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500