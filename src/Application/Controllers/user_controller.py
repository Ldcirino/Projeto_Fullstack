from flask import request, jsonify, make_response
from src.Application.Service.user_service import UserService
from src.Application.Service.login_service import AuthService

class UserController:

    @staticmethod
    def register_user():
        data = request.get_json()

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
        }), 200)