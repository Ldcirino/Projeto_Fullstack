import jwt
import datetime
from src.Infrastructure.Model.user import User

class AuthService:

    @staticmethod
    def login(email, password):

        user = User.query.filter_by(email=email).first()

        if not user:
            return None

        if user.password != password:
            return None

        if user.status != "ATIVO":
            return "INATIVO"

        token = jwt.encode({
            "user_id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, "secret", algorithm="HS256")

        return token