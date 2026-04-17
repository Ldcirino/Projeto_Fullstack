from src.Infrastructure.Model.user import User
from src.config.data_base import db
from src.Application.Service.twilio_service import TwilioService
from werkzeug.security import generate_password_hash, check_password_hash
import random

class UserService:

    @staticmethod
    def create_user(name, cnpj, email, celular, password):
        existing = User.query.filter_by(email=email).first()
        if existing:
            if existing.status == "ATIVO":
                raise Exception("Já existe uma conta ativa com este e-mail.")

            code = f"{random.randint(0, 9999):04d}"
            existing.name = name
            existing.cnpj = cnpj
            existing.email = email
            existing.celular = celular
            existing.password = generate_password_hash(password)
            existing.activation_code = code
            existing.status = "INATIVO"
            db.session.commit()

            try:
                TwilioService.send_whatsapp(existing.celular, code)
            except Exception as e:
                print(f"[Twilio] Falha ao reenviar WhatsApp para {existing.celular}: {e}")

            return existing

        code = f"{random.randint(0, 9999):04d}"
        user = User(
            name=name,
            cnpj=cnpj,
            email=email,
            celular=celular,
            password=generate_password_hash(password),
            status="INATIVO",
            activation_code=code,
        )
        db.session.add(user)
        db.session.commit()
        try:
            TwilioService.send_whatsapp(user.celular, code)
        except Exception as e:
            print(f"[Twilio] Falha ao enviar WhatsApp para {user.celular}: {e}")
        return user

    @staticmethod
    def activate_user(celular, codigo):
        user = User.query.filter_by(celular=celular, activation_code=codigo).first()
        if not user:
            active_user = User.query.filter_by(celular=celular, status="ATIVO").first()
            if active_user:
                return active_user, None
            return None, "Código inválido ou WhatsApp não encontrado."

        user.status = "ATIVO"
        user.activation_code = None
        db.session.commit()
        return user, None

    @staticmethod
    def login(email, password):
        user = User.query.filter_by(email=email).first()
        if not user:
            return None, "Credenciais inválidas."

        if user.status != "ATIVO":
            return None, "Conta ainda não ativada."

        if not check_password_hash(user.password, password):
            return None, "Credenciais inválidas."

        return user, None
