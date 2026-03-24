from src.Application.Controllers.user_controller import UserController
from flask import jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.Infrastructure.Model.user import User

def init_routes(app):

    @app.route('/api', methods=['GET'])
    def health():
        return make_response(jsonify({
            "mensagem": "API - OK"
        }), 200)

    @app.route('/cadastro', methods=['POST'])
    def register_user():
        return UserController.register_user()

    @app.route('/validar_code', methods=['POST'])
    def verify():
        return UserController.verify_user()

    @app.route('/login', methods=['POST'])
    def login():
        return UserController.login_user()

    # ROTA PROTEGIDA
    @app.route('/profile', methods=['GET'])
    @jwt_required()
    def profile():

        # pega o ID do token
        user_id = int(get_jwt_identity())

        user = User.query.get(user_id)

        if not user:
            return make_response(jsonify({
                "msg": "Usuário não encontrado"
            }), 404)

        return make_response(jsonify({
            "id": user.id,
            "email": user.email,
            "status": user.status
        }), 200)