from flask import jsonify, request, g
from app.extensions import db
from app.models.team import Team, TeamMember, TeamInvite, JoinRequest
from app.models.user import User

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
        'member_count': len(team.members)
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
            creator_id=g.user_id
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
    
    # Privacy Guard
    if team.privacy == 'private' and not is_member:
        return jsonify({'error': 'Access denied. This is a private team.'}), 403

    # Serialize Members with User details
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

    response = _serialize_team(team)
    response['members'] = members_data
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