import os
import secrets
import cloudinary.uploader
from flask import current_app
from werkzeug.datastructures import FileStorage


def save_message_file(file: FileStorage) -> str:
    if current_app.config.get("UPLOAD_PROVIDER") == "cloudinary":
        upload_result = cloudinary.uploader.upload(
            file,
            folder="acadlinker/messages"
        )
        return upload_result["secure_url"]

    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(file.filename)
    filename = random_hex + f_ext

    upload_folder = os.path.join(current_app.root_path, "static/uploads")
    os.makedirs(upload_folder, exist_ok=True)

    file.save(os.path.join(upload_folder, filename))
    return filename
