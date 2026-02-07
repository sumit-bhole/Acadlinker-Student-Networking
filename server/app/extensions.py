from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_login import LoginManager

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    # 1. Import User HERE to avoid circular import errors
    from app.models.user import User
    
    # 2. Correct: No int() casting because Supabase IDs are strings
    return User.query.get(user_id)