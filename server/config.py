import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_secure_key')

    # 1. Get the raw URL
    raw_uri = os.getenv('DATABASE_URL')

    if not raw_uri:
        raise ValueError("No DATABASE_URL set for Flask application.")

    # 2. AUTOMATIC FIX: Handle special characters (like '@') in the password
    # We assume the format is: postgresql://user:password@host...
    # The last '@' separates credentials from the host.
    if '@' in raw_uri:
        try:
            # Split the string at the LAST '@' (this separates auth info from the host)
            auth_part, sep, host_part = raw_uri.rpartition('@')
            
            # Now split the auth_part at the LAST ':' (this separates user from password)
            user_part, sep2, password_part = auth_part.rpartition(':')
            
            # URL-encode the password (converts 'bhole@123' -> 'bhole%40123')
            password_part = urllib.parse.quote_plus(password_part)
            
            # Reassemble the URL safely
            raw_uri = f"{user_part}:{password_part}@{host_part}"
        except Exception as e:
            # If parsing fails, we fallback to the raw URI and hope for the best
            print(f"Warning: Could not auto-fix URL password: {e}")

    # 3. Fix for Render/Supabase "postgres://" vs "postgresql://"
    if raw_uri.startswith("postgres://"):
        raw_uri = raw_uri.replace("postgres://", "postgresql://", 1)

    # 4. Set the final URI
    SQLALCHEMY_DATABASE_URI = raw_uri
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Cookies & Other Settings
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False
    REMEMBER_COOKIE_SAMESITE = "Lax"
    REMEMBER_COOKIE_SECURE = False

    # CORS & Cloudinary
    FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
    UPLOAD_PROVIDER = os.getenv("UPLOAD_PROVIDER", "local")
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# Config Subclasses remain the same
class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"