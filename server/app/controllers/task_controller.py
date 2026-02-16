from flask import jsonify, request, g
from app.extensions import db
from app.models.task import Task
from app.models.team import TeamMember
from app.models.user import User

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def _is_member(team_id, user_id):
    return TeamMember.query.filter_by(team_id=team_id, user_id=user_id).first() is not None

def _serialize_task(task):
    return {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'assigned_to': {
            'id': task.assigned_to.id,
            'name': task.assigned_to.full_name,
            'pic': task.assigned_to.profile_pic
        } if task.assigned_to else None
    }

# -------------------------------------------------
# Controller Actions
# -------------------------------------------------

def get_tasks_for_team(team_id):
    if not _is_member(team_id, g.user_id):
        return jsonify({'error': 'Unauthorized access to team tasks'}), 403

    tasks = Task.query.filter_by(team_id=team_id).all()
    return jsonify([_serialize_task(t) for t in tasks]), 200

def create_task():
    data = request.get_json()
    team_id = data.get('team_id')

    if not _is_member(team_id, g.user_id):
        return jsonify({'error': 'Unauthorized'}), 403

    new_task = Task(
        team_id=team_id,
        title=data.get('title'),
        description=data.get('description'),
        status='todo',
        assigned_to_id=data.get('assigned_to_id')
    )
    db.session.add(new_task)
    db.session.commit()

    return jsonify({'message': 'Task created', 'task': _serialize_task(new_task)}), 201

def update_task_status(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    if not _is_member(task.team_id, g.user_id):
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    if 'status' in data:
        task.status = data['status']
    
    if 'assigned_to_id' in data:
        task.assigned_to_id = data['assigned_to_id']

    db.session.commit()
    return jsonify({'message': 'Task updated', 'task': _serialize_task(task)}), 200

def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    if not _is_member(task.team_id, g.user_id):
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200