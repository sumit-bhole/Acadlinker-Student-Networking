from functools import wraps
from flask import request, jsonify, g
from jose import jwt
import os
from app.extensions import db
from app.models.user import User
from app.utils.jwt_utils import get_public_key   # ✅ import here

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # 1. Extract token
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token missing'}), 401

        try:
            print("🔐 Incoming Token:", token[:30])

            # 🔥 GET PUBLIC KEY (ES256 FIX)
            key = get_public_key(token)

            # 🔥 VERIFY TOKEN (ES256)
            payload = jwt.decode(
                token,
                key,
                algorithms=["ES256"],
                options={"verify_aud": False}
            )

            print("✅ JWT Payload:", payload)

            g.user_id = payload.get("sub")
            g.user_email = payload.get("email")

            if not g.user_id:
                return jsonify({'message': 'Invalid token payload'}), 401

            # 3. Check / create user in DB
            user = User.query.get(g.user_id)

            if not user:
                print(f"⚠️ Auto-creating user {g.user_id}")
                user = User(
                    id=g.user_id,
                    email=g.user_email,
                    full_name=g.user_email.split('@')[0]
                )
                db.session.add(user)
                db.session.commit()

        except Exception as e:
            print("❌ JWT ERROR:", str(e))
            return jsonify({'message': 'Invalid token', 'error': str(e)}), 401

        return f(*args, **kwargs)

    return decorated