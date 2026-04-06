import os
import secrets
import cloudinary.uploader
from flask import current_app

def upload_file(file, folder_name="acadlinker/general"):
    """
    Centralized file upload handler.
    Can be used by Posts, Profiles, Teams, and Chats.
    """
    if not file or not file.filename:
        return None

    # Cloudinary Upload
    if current_app.config.get("UPLOAD_PROVIDER") == "cloudinary":
        try:
            upload_result = cloudinary.uploader.upload(
                file,
                folder=folder_name
            )
            return upload_result["secure_url"]
        except Exception as e:
            print(f"Cloudinary Upload Error: {e}")
            return None

    # Local Fallback
    random_hex = secrets.token_hex(8)
    _, ext = os.path.splitext(file.filename)
    filename = random_hex + ext
    upload_folder = os.path.join(current_app.root_path, "static", "uploads")
    os.makedirs(upload_folder, exist_ok=True)
    
    file.save(os.path.join(upload_folder, filename))
    return filename