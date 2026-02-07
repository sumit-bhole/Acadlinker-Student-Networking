def serialize_user(user):
    return {
        'id': user.id,
        'full_name': user.full_name,
        'email': user.email,
        'profile_pic': getattr(user, 'profile_pic', None),
        'location': getattr(user, 'location', None)
    }
