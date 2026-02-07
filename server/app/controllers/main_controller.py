from flask import jsonify

def get_api_status():
    """
    Health check logic
    """
    return jsonify({
        "message": "AcadLinker API is running 🚀",
        "available_routes": [
            "/api/auth/*",
            "/api/profile/*",
            "/api/posts/*",
            "/api/messages/*",
            "/api/notifications/*"
        ]
    }), 200