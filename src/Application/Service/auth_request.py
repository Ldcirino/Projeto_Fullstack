from flask import request
from src.config.auth import decode_token
from src.Infrastructure.Model.user import User

class RequestAuth:

    @staticmethod
    def get_current_user():
        auth_header = (request.headers.get("Authorization") or "").strip()
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return None

        user_id = decode_token(token)
        if not user_id:
            return None

        return User.query.get(user_id)
