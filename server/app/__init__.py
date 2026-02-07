import os
from flask import Flask
from flask_cors import CORS
import cloudinary

# Import both configs
from config import DevelopmentConfig, ProductionConfig 
from app.extensions import db, migrate, bcrypt, login_manager

def create_app():
    app = Flask(__name__)

    # --- 🛠️ FIX 1: AUTO-DETECT ENVIRONMENT ---
    # On Render, FLASK_ENV is usually set to 'production'
    env = os.getenv('FLASK_ENV', 'development')
    if env == 'production':
        app.config.from_object(ProductionConfig)
    else:
        app.config.from_object(DevelopmentConfig)

    # --- 🛠️ FIX 2: EXPLICIT CORS ---
    # Ensure Vercel is allowed explicitly
    frontend_url = os.getenv("FRONTEND_URL", "*")
    CORS(
        app,
        origins=[frontend_url, "http://localhost:5173"],
        supports_credentials=True
    )

    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    login_manager.init_app(app)

    # Cloudinary
    if app.config.get("UPLOAD_PROVIDER") == "cloudinary":
        cloudinary.config(
            cloud_name=app.config["CLOUDINARY_CLOUD_NAME"],
            api_key=app.config["CLOUDINARY_API_KEY"],
            api_secret=app.config["CLOUDINARY_API_SECRET"]
        )

    register_blueprints(app)

    # Admin Panel
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
    from app.routes.notification_routes import notifications_bp 

    app.register_blueprint(auth_bp)
    app.register_blueprint(friends_bp)
    app.register_blueprint(messages_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(suggestions_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(notifications_bp)