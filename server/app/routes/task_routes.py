from flask import Blueprint
from app.middleware.auth_middleware import token_required
from app.controllers.task_controller import (
    get_tasks_for_team,
    create_task,
    update_task_status,
    delete_task
)

task_bp = Blueprint('task', __name__, url_prefix='/api/tasks')

@task_bp.route('/team/<int:team_id>', methods=['GET'])
@token_required
def get_team_tasks(team_id):
    return get_tasks_for_team(team_id)

@task_bp.route('/create', methods=['POST'])
@token_required
def create():
    return create_task()

@task_bp.route('/<int:task_id>', methods=['PATCH', 'PUT'])
@token_required
def update(task_id):
    return update_task_status(task_id)

@task_bp.route('/<int:task_id>', methods=['DELETE'])
@token_required
def delete(task_id):
    return delete_task(task_id)