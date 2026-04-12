from flask import jsonify, request, g
from datetime import datetime
from app.extensions import db
from app.models.task import Task
from app.models.team import TeamMember
from app.models.user import User
from app.utils.upload_util import upload_file # 🟢 Centralized uploader

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def _get_membership(team_id, user_id):
    """Returns the TeamMember object to check roles"""
    return TeamMember.query.filter_by(team_id=team_id, user_id=user_id).first()

def _serialize_task(task):
    """Convert Task object to a professional JSON structure"""
    
    # 🟢 Dynamic Overdue Logic
    is_overdue = False
    if task.due_date and task.status != 'done':
        is_overdue = datetime.utcnow() > task.due_date

    return {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'priority': task.priority,  
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'created_at': task.created_at.isoformat(),
        'is_overdue': is_overdue,
        'proof': {
            'text': task.proof_text,
            'link': task.proof_link,
            'image': task.proof_image
        } if task.status == 'done' else None,
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
    if not _get_membership(team_id, g.user_id):
        return jsonify({'error': 'Unauthorized access to team workspace'}), 403

    # Fetch ALL tasks for the Insights Dashboard
    tasks_data = []
    all_tasks = Task.query.filter_by(team_id=team_id).order_by(Task.created_at.desc()).all()
    
    return jsonify([_serialize_task(t) for t in all_tasks]), 200


def create_task():
    data = request.get_json()
    team_id = data.get('team_id')

    membership = _get_membership(team_id, g.user_id)
    if not membership:
        return jsonify({'error': 'Unauthorized'}), 403

    assigned_to_id = data.get('assigned_to_id')
    status = data.get('status', 'todo')

    # 🟢 ROLE ENFORCEMENT
    if membership.role == 'member':
        if assigned_to_id and str(assigned_to_id) != str(g.user_id):
            return jsonify({'error': 'Members can only assign tasks to themselves.'}), 403

    # 🟢 STRICT WIP LIMIT: Max 1 "In Progress" task per user
    if status == 'in_progress' and assigned_to_id:
        active_task = Task.query.filter_by(team_id=team_id, assigned_to_id=assigned_to_id, status='in_progress').first()
        if active_task:
            return jsonify({'error': 'WIP Limit Reached: User is already working on a task. Complete or pause it first.'}), 400

    try:
        new_task = Task(
            team_id=team_id,
            title=data.get('title'),
            description=data.get('description', ''),
            priority=data.get('priority', 'medium'), 
            status=status,
            assigned_to_id=assigned_to_id,
            due_date=datetime.fromisoformat(data.get('due_date')) if data.get('due_date') else None
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({'message': 'Task created successfully', 'task': _serialize_task(new_task)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


def update_task_status(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    membership = _get_membership(task.team_id, g.user_id)
    if not membership:
        return jsonify({'error': 'Unauthorized'}), 403

    is_leader = membership.role == 'leader'
    is_assignee = str(task.assigned_to_id) == str(g.user_id)

    # 🟢 ROLE ENFORCEMENT: Lockout Logic
    if task.status == 'done' and not is_leader:
        return jsonify({'error': 'Task is locked. Only a leader can reject/reopen a completed task.'}), 403

    if not is_leader and not is_assignee and task.assigned_to_id is not None:
        return jsonify({'error': 'You can only edit your own tasks.'}), 403

    data = request.form.to_dict() if request.form else request.get_json() or {}
    new_status = data.get('status', task.status)
    
    # 🟢 1. Figure out who the target assignee will be after this update
    target_assignee = task.assigned_to_id
    if 'assigned_to_id' in data:
        new_assignee = data['assigned_to_id']
        if new_assignee == "": new_assignee = None
        
        if is_leader:
            target_assignee = new_assignee
        elif not is_leader and (new_assignee == str(g.user_id) or new_assignee is None):
            target_assignee = new_assignee
        else:
            return jsonify({'error': 'Members can only assign tasks to themselves.'}), 403

    # 🟢 2. STRICT WIP LIMIT: Max 1 "In Progress" task per user
    if new_status == 'in_progress' and target_assignee:
        active_task = Task.query.filter(
            Task.team_id == task.team_id,
            Task.assigned_to_id == target_assignee,
            Task.status == 'in_progress',
            Task.id != task.id # Exclude the task we are currently editing!
        ).first()
        
        if active_task:
            return jsonify({'error': 'WIP Limit Reached: A user can only work on ONE task at a time. Complete or pause the active task first.'}), 400

    # 🟢 STATE MACHINE: Moving to "Done"
    if new_status == 'done' and task.status != 'done':
        proof_text = data.get('proof_text')
        if not proof_text or not proof_text.strip():
            return jsonify({'error': 'Proof of work (text description) is required to complete a task.'}), 400
            
        task.proof_text = proof_text
        task.proof_link = data.get('proof_link')
        
        if "proof_image" in request.files and request.files["proof_image"].filename:
            file = request.files["proof_image"]
            task.proof_image = upload_file(file, folder_name="acadlinker/tasks")

    # 🟢 STATE MACHINE: Leader kicking it back to "In Progress"
    if new_status != 'done' and task.status == 'done' and is_leader:
        task.proof_text = None
        task.proof_link = None
        task.proof_image = None

    # Apply standard updates
    task.status = new_status
    task.assigned_to_id = target_assignee
    if 'priority' in data: task.priority = data['priority']
    if 'title' in data: task.title = data['title']
    if 'description' in data: task.description = data['description']
    
    if 'due_date' in data:
        task.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None

    db.session.commit()
    return jsonify({'message': 'Task updated successfully', 'task': _serialize_task(task)}), 200

def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    membership = _get_membership(task.team_id, g.user_id)
    if not membership:
        return jsonify({'error': 'Unauthorized'}), 403
        
    if membership.role != 'leader':
        return jsonify({'error': 'Only team leaders can permanently delete tasks.'}), 403

    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500