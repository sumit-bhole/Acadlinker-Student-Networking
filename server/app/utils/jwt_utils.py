from jose import jwt
import requests
import os
import time

SUPABASE_URL = os.getenv("SUPABASE_URL")

if not SUPABASE_URL:
    raise ValueError("Missing SUPABASE_URL in env")

JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

# 🔥 CACHE VARIABLES
JWKS_CACHE = None
JWKS_LAST_FETCH = 0
CACHE_TTL = 3600  # 1 hour


def get_jwks():
    global JWKS_CACHE, JWKS_LAST_FETCH

    current_time = time.time()

    # ✅ Refresh cache if expired
    if JWKS_CACHE is None or (current_time - JWKS_LAST_FETCH > CACHE_TTL):
        print("🔄 Fetching JWKS from Supabase...")
        JWKS_CACHE = requests.get(JWKS_URL).json()
        JWKS_LAST_FETCH = current_time
    else:
        print("⚡ Using cached JWKS")

    return JWKS_CACHE


def get_public_key(token):
    jwks = get_jwks()
    headers = jwt.get_unverified_header(token)

    for key in jwks["keys"]:
        if key["kid"] == headers["kid"]:
            return key

    raise Exception("Public key not found")