from functools import wraps
from flask import request, jsonify, g
from supabase import create_client, Client
import os
import time  # <--- NEW: For cache expiration
from app.extensions import db
from app.models.user import User

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 🚀 MEMORY CACHE TO PREVENT SOCKET ERRORS ---
# Stores validated tokens for 60 seconds.
# Format: { "token_string": { "user_id": "...", "email": "...", "expires": 1234567890 } }
TOKEN_CACHE = {}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # 1. Get Token from Header
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token format is invalid!'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        # ---------------------------------------------------------
        # 2. ⚡ CHECK CACHE FIRST (The Speed Fix)
        # ---------------------------------------------------------
        current_time = time.time()
        
        # Clean up old cache keys (Optional simple garbage collection)
        # In a production app, you might use Redis, but this works for now.
        if len(TOKEN_CACHE) > 1000:
            TOKEN_CACHE.clear()

        cached_session = TOKEN_CACHE.get(token)
        
        if cached_session and cached_session['expires'] > current_time:
            # Cache Hit! Skip Supabase API call
            g.user_id = cached_session['user_id']
            g.user_email = cached_session['email']
            return f(*args, **kwargs)

        # ---------------------------------------------------------
        # 3. CACHE MISS: Verify with Supabase (Network Call)
        # ---------------------------------------------------------
        try:
            user_response = supabase.auth.get_user(token)
            user = user_response.user
            
            if not user:
                raise Exception("User not found or token invalid")

            g.user_id = user.id
            g.user_email = user.email
            
            # 4. SELF-HEALING LOGIC (Only needed on cache miss)
            # Check if this user actually exists in our local SQL database
            local_user = User.query.get(g.user_id)
            
            if not local_user:
                print(f"⚠️ User {g.user_id} detected in Auth but missing in DB. Auto-creating...")
                meta = user.user_metadata or {}
                
                new_user = User(
                    id=g.user_id,
                    email=g.user_email,
                    # Fallback to email username if full_name is missing
                    full_name=meta.get('full_name', g.user_email.split('@')[0]),
                    mobile_no=meta.get('mobile_no', None),
                    profile_pic=meta.get('avatar_url', None)
                )
                
                db.session.add(new_user)
                db.session.commit()
                print("✅ User profile created successfully in Database.")

            # 5. 💾 SAVE TO CACHE (Valid for 60 seconds)
            TOKEN_CACHE[token] = {
                "user_id": user.id,
                "email": user.email,
                "expires": current_time + 60
            }
            
        except Exception as e:
            print(f"Auth Network Error: {e}")
            return jsonify({'message': 'Invalid Token or Server Busy', 'error': str(e)}), 401
            
        return f(*args, **kwargs)
    
    return decorated