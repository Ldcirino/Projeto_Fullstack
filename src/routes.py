from flask import request, jsonify, make_response
from src.Application.Service.user_service import UserService

def init_routes(app):
    # Rota de Health Check (Mantida para teste do Docker)
    @app.route('/api', methods=['GET'])
    def health():
        return make_response(jsonify({"mensagem": "API - OK; Docker - Up"}), 200)

    # 1. Cadastro de Seller (Substitui o antigo /user)
    # Endpoint: http://localhost:8080/api/sellers
    @app.route('/api/sellers', methods=['POST'])
    def register_seller():
        data = request.get_json()
        UserService.create_seller(data)
        return make_response(jsonify({"mensagem": "Seller criado! Aguarde o código no WhatsApp."}), 201)

    # 2. Ativação via Código de 4 dígitos
    # Endpoint: http://localhost:8080/api/sellers/activate
    @app.route('/api/sellers/activate', methods=['POST'])
    def activate_seller():
        data = request.get_json()
        success = UserService.activate_seller(data.get('celular'), data.get('codigo'))
        
        if success:
            return make_response(jsonify({"mensagem": "Conta ativada com sucesso!"}), 200)
        return make_response(jsonify({"erro": "Código ou celular inválido"}), 400)

    # 3. Login com Autenticação JWT
    # Endpoint: http://localhost:8080/api/auth/login
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        # O UserService agora verifica se o Seller está 'Ativo' antes de logar
        response, status = UserService.login(data.get('email'), data.get('senha'))
        return make_response(jsonify(response), status)