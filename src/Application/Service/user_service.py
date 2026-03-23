import random
from flask_jwt_extended import create_access_token
from src.Infrastructure.Model.user import User
from src.Infrastructure.http.twilio_service import TwilioService
from src.config.data_base import db

class UserService:
    @staticmethod
    def create_seller(data):
        # Gera código de 4 dígitos para o WhatsApp
        code = str(random.randint(1000, 9999))
        
        new_user = User(
            name=data['nome'],
            email=data['email'],
            password=data['senha'], # Dica: No futuro, use hash aqui!
            cnpj=data.get('cnpj'),
            celular=data.get('celular'),
            activation_code=code,
            status='Inativo'
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Tenta enviar o código via Twilio
        try:
            TwilioService.send_activation_code(new_user.celular, code)
        except Exception as e:
            print(f"Erro Twilio: {e}") # Log para você ver no terminal do Docker
            
        return new_user

    @staticmethod
    def activate_seller(celular, code):
        user = User.query.filter_by(celular=celular, activation_code=code).first()
        if user:
            user.status = 'Ativo'
            user.activation_code = None # Limpa o código após sucesso
            db.session.commit()
            return True
        return False

    @staticmethod
    def login(email, password):
        user = User.query.filter_by(email=email, password=password).first()
        
        if not user or user.password != password:
            return {"erro": "E-mail ou senha inválidos"}, 401
            
        if user.status != 'Ativo':
            return {"erro": "Conta inativa. Ative via WhatsApp primeiro."}, 403
            
        # Cria o token JWT com o ID do usuário
        token = create_access_token(identity=str(user.id))
        return {"token": token, "user": user.to_dict()}, 200