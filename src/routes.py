from src.Application.Controllers.user_controller import UserController
from src.Application.Controllers.product_controller import ProductController
from src.Application.Controllers.sale_controller import SaleController
from flask import jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.Infrastructure.Model.user import User

def init_routes(app):

    # Health check
    @app.route('/', methods=['GET'])
    def root():
        return make_response(
            jsonify(
                {
                    "mensagem": "API rodando. Use /api para health check.",
                    "rotas": {
                        "health": "/api",
                        "cadastro_mini_mercado": "/api/sellers",
                        "ativacao_conta": "/api/sellers/activate",
                        "auth_login": "/api/auth/login",
                    },
                }
            ),
            200,
        )

    @app.route('/api', methods=['GET'])
    def health():
        return make_response(jsonify({"mensagem": "API - OK; Docker - Up"}), 200)

    # ─── Sellers ──────────────────────────────────────────
    @app.route('/api/sellers', methods=['POST'])
    def register_user():
        return UserController.register_user()

    @app.route('/api/sellers/activate', methods=['POST'])
    def activate_user():
        return UserController.activate_user()

    # ─── Auth ─────────────────────────────────────────────
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        return UserController.login()

    # ─── Products ─────────────────────────────────────────
    @app.route('/api/products', methods=['POST'])
    def create_product():
        return ProductController.create_product()

    @app.route('/api/products', methods=['GET'])
    def list_products():
        return ProductController.list_products()

    @app.route('/api/products/<int:product_id>', methods=['GET'])
    def get_product(product_id):
        return ProductController.get_product(product_id)

    @app.route('/api/products/<int:product_id>', methods=['PUT'])
    def update_product(product_id):
        return ProductController.update_product(product_id)

    @app.route('/api/products/<int:product_id>/inactivate', methods=['PATCH'])
    def inactivate_product(product_id):
        return ProductController.inactivate_product(product_id)

    # ─── Sales ────────────────────────────────────────────
    @app.route('/api/sales', methods=['POST'])
    def create_sale():
        return SaleController.create_sale()

    @app.route('/api/sales', methods=['GET'])
    def list_sales():
        return SaleController.list_sales()

    # ─── Dashboard ────────────────────────────────────────
    @app.route('/api/dashboard', methods=['GET'])
    def get_dashboard():
        return SaleController.get_dashboard()
