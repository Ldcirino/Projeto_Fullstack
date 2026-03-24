import random
from src.Domain.user import UserDomain
from src.Infrastructure.Model.user import User
from src.Application.Service.twilio_service import TwilioService
from src.config.data_base import db

class UserService:

    @staticmethod
    def create_user(name, cnpj, email, phone, password):

        activation_code = str(random.randint(1000, 9999))

        user = User(
            name=name,
            cnpj=cnpj,
            email=email,
            phone=phone,
            password=password,
            activation_code=activation_code,
            status="INATIVO"
        )

        db.session.add(user)
        db.session.commit()

        # ENVIA WHATSAPP
        TwilioService.send_whatsapp(phone, activation_code)

        return UserDomain(user.id, user.name, user.email, user.cnpj, user.phone)

    @staticmethod
    def verify_code(email, code):

        user = User.query.filter_by(email=email).first()

        if not user:
            return None

        if str(user.activation_code).strip() != str(code).strip():
            return False

        user.status = "ATIVO"
        user.activation_code = None

        db.session.commit()

        return True