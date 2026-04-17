<<<<<<< HEAD
import random
from src.Domain.user import UserDomain
from src.Infrastructure.Model.user import User
from src.Application.Service.twilio_service import TwilioService
from src.config.data_base import db
=======
from src.Infrastructure.Model.user import User
from src.config.data_base import db 
from src.Application.Service.twilio_service import TwilioService
from werkzeug.security import generate_password_hash, check_password_hash
import random
>>>>>>> 25bfe06 (Criação Front-end pagina de cadastro,autenticação e login)

class UserService:

    @staticmethod
<<<<<<< HEAD
    def create_user(name, cnpj, email, phone, password):

        activation_code = str(random.randint(1000, 9999))

=======
    def create_user(name, cnpj, email, celular, password):
        existing = User.query.filter((User.email == email) | (User.celular == celular)).first()
        if existing:
            if existing.status == "ATIVO":
                raise Exception("Já existe uma conta ativa com este e-mail ou WhatsApp.")

            # Conta existe mas ainda não foi ativada: reenvia um novo código
            # (e atualiza os dados informados no cadastro).
            # Evita travar o usuário em ambiente de testes.
            email_owner = User.query.filter_by(email=email).first()
            if email_owner and email_owner.id != existing.id:
                raise Exception("Este e-mail já está vinculado a outra conta.")

            phone_owner = User.query.filter_by(celular=celular).first()
            if phone_owner and phone_owner.id != existing.id:
                raise Exception("Este WhatsApp já está vinculado a outra conta.")

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
>>>>>>> 25bfe06 (Criação Front-end pagina de cadastro,autenticação e login)
        user = User(
            name=name,
            cnpj=cnpj,
            email=email,
<<<<<<< HEAD
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
=======
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
            # Mantém o cadastro, mas expõe o erro no console para facilitar debug.
            print(f"[Twilio] Falha ao enviar WhatsApp para {user.celular}: {e}")
        return user

    @staticmethod
    def activate_user(celular, codigo):
        user = User.query.filter_by(celular=celular).first()
        if not user:
            return None, "Conta não encontrada para este WhatsApp."

        if not user.activation_code:
            if user.status == "ATIVO":
                return user, None
            return None, "Código de ativação não encontrado. Faça o cadastro novamente."

        if str(user.activation_code).strip() != str(codigo).strip():
            return None, "Código inválido."

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
>>>>>>> 25bfe06 (Criação Front-end pagina de cadastro,autenticação e login)
