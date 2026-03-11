from src.Application.Controllers.user_controller import UserController
from flask import jsonify, make_response

def init_routes(app):

    @app.route('/api', methods=['GET'])
    def health():
        return make_response(jsonify({
            "mensagem": "API - OK; Docker - Up",
        }), 200)

    @app.route('/user', methods=['POST'])
    def register_user():
        return UserController.register_user()

    @app.route('/seller/verify', methods=['POST'])
    def verify():
        return UserController.verify_user()

    @app.route('/seller/login', methods=['POST'])
    def login():
        return UserController.login_user()
    
    

