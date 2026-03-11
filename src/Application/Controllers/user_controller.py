from flask import request, jsonify, make_response
from src.Application.Service.user_service import UserService

class UserController:
    from flask import request, jsonify, make_response
from src.Application.Service.user_service import UserService

class UserController:
    @staticmethod
    def register_user():
        data = request.get_json()

        name = data.get("name")
        cnpj = data.get("cnpj")
        email = data.get("email")
        phone = data.get("phone")
        password = data.get("password")

        user = UserService.create_user(name, cnpj, email, phone, password)

        return jsonify({
            "message": "Usuário criado com sucesso",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "cnpj": user.cnpj,
                "phone": user.phone
            }
        }), 201
#login

    @staticmethod
    def login_user():

        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        token = AuthService.login(email, password)

        if token is None:
            return make_response(jsonify({"erro": "Credenciais inválidas"}), 401)

        if token == "INATIVO":
            return make_response(jsonify({"erro": "Usuário não ativado"}), 403)

        return jsonify({
            "token": token
    })


#Controller para ativação
    @staticmethod
    def verify_user():

        data = request.get_json()

        email = data.get("email")
        code = data.get("code")

        result = UserService.verify_code(email, code)

        if result is None:
            return make_response(jsonify({"erro": "Usuário não encontrado"}), 404)

        if result is False:
            return make_response(jsonify({"erro": "Código inválido"}), 400)

        return make_response(jsonify({
            "mensagem": "Conta ativada com sucesso"
    }), 200)