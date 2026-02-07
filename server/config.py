import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_secure_key')

    # 1. Get and Fix the URI
    raw_uri = os.getenv('DATABASE_URL')

    if not raw_uri:
        raw_uri = "sqlite:///app.db"
    else:
        if raw_uri.startswith("postgres://"):
            raw_uri = raw_uri.replace("postgres://", "postgresql://", 1)

        if '@' in raw_uri and '://' in raw_uri:
            try:
                protocol, rest = raw_uri.split('://', 1)
                auth_part, host_part = rest.rpartition('@')[0], rest.rpartition('@')[2]
                
                if ':' in auth_part:
                    user, password = auth_part.rpartition(':')[0], auth_part.rpartition(':')[2]
                    encoded_password = urllib.parse.quote_plus(password)
                    raw_uri = f"{protocol}://{user}:{encoded_password}@{host_part}"
            except Exception as e:
                print(f"⚠️ URL Fix failed, using raw: {e}")

    SQLALCHEMY_DATABASE_URI = raw_uri
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # 2. Deployment Settings (CRITICAL FOR CORS)
    # Check if we are in production
    is_prod = os.getenv('FLASK_ENV') == 'production'
    
    # Must be "None" and "Secure" for cross-domain cookies (Vercel -> Render)
    SESSION_COOKIE_SAMESITE = "None" if is_prod else "Lax"
    SESSION_COOKIE_SECURE = True if is_prod else False
    
    # Ensure these match for cross-site auth
    REMEMBER_COOKIE_SAMESITE = "None" if is_prod else "Lax"
    REMEMBER_COOKIE_SECURE = True if is_prod else False

    # CORS
    FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
    
    # Cloudinary
    UPLOAD_PROVIDER = os.getenv("UPLOAD_PROVIDER", "local")
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    # Ensure production strictly uses secure cookies
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "None"

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"