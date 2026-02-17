from flask import jsonify, request, g
from datetime import datetime
from app.extensions import db
from app.models.task import Task
from app.models.team import TeamMember
from app.models.user import User

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def _is_member(team_id, user_id):
    """Check if a user belongs to the team"""
    return TeamMember.query.filter_by(team_id=team_id, user_id=user_id).first() is not None

def _serialize_task(task):
    """Convert Task object to a professional JSON structure"""
    return {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'priority': task.priority,  # 🆕 Added Priority field
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'created_at': task.created_at.isoformat(),
        'assigned_to': {
            'id': task.assigned_to.id,
            'full_name': task.assigned_to.full_name,
            'profile_pic': task.assigned_to.profile_pic
        } if task.assigned_to else None
    }

# -------------------------------------------------
# Controller Actions
# -------------------------------------------------

def get_tasks_for_team(team_id):
    """Fetch all tasks for a specific workspace"""
    if not _is_member(team_id, g.user_id):
        return jsonify({'error': 'Unauthorized access to team workspace'}), 403

    tasks = Task.query.filter_by(team_id=team_id).order_by(Task.created_at.desc()).all()
    return jsonify([_serialize_task(t) for t in tasks]), 200

def create_task():
    """Create a new task with priority and optional assignee"""
    data = request.get_json()
    team_id = data.get('team_id')

    if not _is_member(team_id, g.user_id):
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        new_task = Task(
            team_id=team_id,
            title=data.get('title'),
            description=data.get('description', ''),
            priority=data.get('priority', 'medium'), # 🆕 Defaults to medium
            status=data.get('status', 'todo'),
            assigned_to_id=data.get('assigned_to_id'),
            due_date=datetime.fromisoformat(data.get('due_date')) if data.get('due_date') else None
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({'message': 'Task created successfully', 'task': _serialize_task(new_task)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def update_task_status(task_id):
    """Update task details including status, priority, and assignments"""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    if not _is_member(task.team_id, g.user_id):
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    
    # Update logic for all relevant fields
    if 'status' in data:
        task.status = data['status']
    
    if 'priority' in data: # 🆕 Allow changing priority
        task.priority = data['priority']
        
    if 'assigned_to_id' in data:
        task.assigned_to_id = data['assigned_to_id']
        
    if 'title' in data:
        task.title = data['title']
        
    if 'description' in data:
        task.description = data['description']

    if 'due_date' in data:
        task.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None

    db.session.commit()
    return jsonify({'message': 'Task updated successfully', 'task': _serialize_task(task)}), 200

def delete_task(task_id):
    """Permanently remove a task from the team"""
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    if not _is_member(task.team_id, g.user_id):
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500