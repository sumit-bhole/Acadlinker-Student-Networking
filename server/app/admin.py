from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_login import current_user
from flask import redirect, url_for

# Safe imports matching your file structure
from app.models.user import User
from app.models.post import Post
from app.models.friend_request import FriendRequest  # <--- CORRECT (New file name)
# Add others if needed: from app.models.message import Message

# -------------------------------------------------
# Optional: Secure Admin Access
# -------------------------------------------------
class SecureModelView(ModelView):
    def is_accessible(self):
        # Checks if user is logged in AND has 'is_admin' set to True
        # If your User model doesn't have 'is_admin' yet, change this to:
        # return current_user.is_authenticated
        return current_user.is_authenticated and getattr(current_user, "is_admin", False)

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for("auth.login"))

# -------------------------------------------------
# Admin Initializer
# -------------------------------------------------
def init_admin(app, db):
    admin = Admin(
        app,
        name="AcadLinker Admin",
        template_mode="bootstrap3"
    )

    # The try/except block prevents crashes if tables aren't created yet
    try:
        admin.add_view(SecureModelView(User, db.session))
        admin.add_view(SecureModelView(Post, db.session))
        admin.add_view(SecureModelView(FriendRequest, db.session))
    except Exception as e:
        print(f"Warning: Could not add admin views: {e}")