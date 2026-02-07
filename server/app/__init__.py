from flask import Flask
from flask_cors import CORS
import cloudinary

from config import DevelopmentConfig
from app.extensions import db, migrate, bcrypt, login_manager


def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # -----------------------
    # CORS
    # -----------------------
    CORS(
        app,
        origins=app.config.get("FRONTEND_URL", "*"),
        supports_credentials=True
    )

    # -----------------------
    # Initialize Extensions
    # -----------------------
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    login_manager.init_app(app)

    # -----------------------
    # Cloudinary (optional)
    # -----------------------
    if app.config.get("UPLOAD_PROVIDER") == "cloudinary":
        cloudinary.config(
            cloud_name=app.config["CLOUDINARY_CLOUD_NAME"],
            api_key=app.config["CLOUDINARY_API_KEY"],
            api_secret=app.config["CLOUDINARY_API_SECRET"]
        )

    # -----------------------
    # Register Blueprints
    # -----------------------
    register_blueprints(app)

    # -----------------------
    # Admin Panel
    # -----------------------
    from app.admin import init_admin
    init_admin(app, db)

    return app

def register_blueprints(app):
    from app.routes.auth_routes import auth_bp
    from app.routes.friend_routes import friends_bp
    from app.routes.message_routes import messages_bp
    from app.routes.post_routes import posts_bp
    from app.routes.profile_routes import profile_bp
    from app.routes.search_routes import search_bp
    from app.routes.suggestion_routes import suggestions_bp
    from app.routes.main_routes import main_bp

    # --- Add Notification Import ---
    # (Ensure app/routes/notification_routes.py exists!)
    from app.routes.notification_routes import notifications_bp 

    app.register_blueprint(auth_bp)
    app.register_blueprint(friends_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(suggestions_bp)
    app.register_blueprint(main_bp)

    # --- Register Notification Blueprint ---
    app.register_blueprint(notifications_bp)