from flask_jwt_extended import create_access_token
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

        token = create_access_token(identity=str(user.id))

        return token