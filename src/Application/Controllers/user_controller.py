from flask import request, jsonify, make_response
from src.Application.Service.user_service import UserService
<<<<<<< HEAD
from src.Application.Service.login_service import AuthService
=======
from src.config.auth import generate_token
>>>>>>> 25bfe06 (Criação Front-end pagina de cadastro,autenticação e login)

class UserController:

    @staticmethod
    def register_user():
        data = request.get_json()
<<<<<<< HEAD

        user = UserService.create_user(
            data.get("name"),
            data.get("cnpj"),
            data.get("email"),
            data.get("phone"),
            data.get("password")
        )

        return jsonify({
            "message": "Usuário criado com sucesso",
            "user": user.to_dict()
        }), 201

    @staticmethod
    def login_user():

        data = request.get_json()

        token = AuthService.login(
            data.get("email"),
            data.get("password")
        )

        if token is None:
            return make_response(jsonify({"erro": "Credenciais inválidas"}), 401)

        if token == "INATIVO":
            return make_response(jsonify({"erro": "Usuário não ativado"}), 403)

        return jsonify({
            "token": token
        })

    @staticmethod
    def verify_user():

        data = request.get_json()

        result = UserService.verify_code(
            data.get("email"),
            data.get("code")
        )

        if result is None:
            return make_response(jsonify({"erro": "Usuário não encontrado"}), 404)

        if result is False:
            return make_response(jsonify({"erro": "Código inválido"}), 400)

        return make_response(jsonify({
            "mensagem": "Conta ativada com sucesso"
=======
        name = data.get('name')
        cnpj = data.get('cnpj')
        email = data.get('email')
        celular = data.get('celular')
        password = data.get('password')

        if not all([name, cnpj, email, celular, password]):
            return make_response(jsonify({"erro": "Campos obrigatórios faltando"}), 400)

        try:
            user = UserService.create_user(name, cnpj, email, celular, password)
            return make_response(jsonify({
                "mensagem": "Cadastro realizado! Verifique seu WhatsApp para ativar a conta.",
                "usuario": user.to_dict()
            }), 201)
        except Exception as e:
            return make_response(jsonify({"erro": str(e)}), 400)

    @staticmethod
    def activate_user():
        data = request.get_json()
        celular = data.get('celular')
        codigo = data.get('codigo')

        if not celular or not codigo:
            return make_response(jsonify({"erro": "Celular e código são obrigatórios"}), 400)

        user, error = UserService.activate_user(celular, codigo)
        if error:
            return make_response(jsonify({"erro": error}), 400)

        return make_response(jsonify({
            "mensagem": "Conta ativada com sucesso!",
            "usuario": user.to_dict()
        }), 200)

    @staticmethod
    def login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('senha')

        if not email or not password:
            return make_response(jsonify({"erro": "Email e senha são obrigatórios"}), 400)

        user, error = UserService.login(email, password)
        if error:
            return make_response(jsonify({"erro": error}), 401)

        token = generate_token(user.id)
        return make_response(jsonify({
            "mensagem": "Login realizado com sucesso!",
            "token": token,
            "usuario": user.to_dict()
>>>>>>> 25bfe06 (Criação Front-end pagina de cadastro,autenticação e login)
        }), 200)