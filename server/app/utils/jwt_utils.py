from jose import jwt
import requests
import os
import time
import threading

SUPABASE_URL = os.getenv("SUPABASE_URL")

if not SUPABASE_URL:
    raise ValueError("Missing SUPABASE_URL in env")

JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

JWKS_CACHE = None
JWKS_LAST_FETCH = 0
CACHE_TTL = 3600  # 1 hour

JWKS_LOCK = threading.Lock()


def get_jwks():
    global JWKS_CACHE, JWKS_LAST_FETCH

    current_time = time.time()

    if JWKS_CACHE and (current_time - JWKS_LAST_FETCH < CACHE_TTL):
        return JWKS_CACHE

    with JWKS_LOCK:
        if JWKS_CACHE and (current_time - JWKS_LAST_FETCH < CACHE_TTL):
            return JWKS_CACHE

        try:
            print("🔄 Fetching JWKS from Supabase...")

            response = requests.get(JWKS_URL, timeout=5)
            response.raise_for_status()

            data = response.json()

            if "keys" not in data:
                raise Exception("Invalid JWKS format")

            JWKS_CACHE = data
            JWKS_LAST_FETCH = current_time

        except Exception as e:
            print(f"⚠️ JWKS fetch failed: {e}")

            if JWKS_CACHE:
                print("⚠️ Using stale JWKS cache")
                return JWKS_CACHE

            raise Exception("JWKS unavailable and no cache present")

    return JWKS_CACHE


def get_public_key(token):
    try:
        jwks = get_jwks()
        headers = jwt.get_unverified_header(token)

        kid = headers.get("kid")
        if not kid:
            raise Exception("Token missing 'kid'")

        for key in jwks["keys"]:
            if key.get("kid") == kid:
                return key

        raise Exception(f"Public key not found for kid: {kid}")

    except Exception as e:
        print(f"❌ Public key error: {e}")
        raise