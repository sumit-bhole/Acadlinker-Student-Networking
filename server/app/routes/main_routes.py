from flask import Blueprint
from app.controllers.main_controller import get_api_status

# Define Blueprint
main_bp = Blueprint("main", __name__)

# -------------------------------------------------
# Routes
# -------------------------------------------------
@main_bp.route("/", methods=["GET"])
def index():
    return get_api_status()