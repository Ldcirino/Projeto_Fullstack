from flask import request, jsonify, make_response
from src.Application.Service.auth_request import RequestAuth
from src.config.data_base import db
from src.Infrastructure.Model.product import Product
from src.Infrastructure.Model.sale import Sale


class SaleController:
    @staticmethod
    def create_sale():
        user = RequestAuth.get_current_user()
        if not user or user.status != "ATIVO":
            return make_response(jsonify({"erro": "Acesso não autorizado."}), 401)

        data = request.get_json() or {}
        product_id = data.get("produtoId") or data.get("product_id")
        quantity = data.get("quantidade") or data.get("quantity")

        if product_id is None or quantity is None:
            return make_response(jsonify({"erro": "Campos obrigatórios faltando."}), 400)

        try:
            product_id = int(product_id)
            quantity = int(quantity)
        except (ValueError, TypeError):
            return make_response(jsonify({"erro": "Produto ou quantidade inválidos."}), 400)

        product = Product.query.filter_by(id=product_id, seller_id=user.id).first()
        if not product:
            return make_response(jsonify({"erro": "Produto não encontrado."}), 404)

        if product.status != "Ativo":
            return make_response(jsonify({"erro": "Produto inativo não pode ser vendido."}), 400)

        if quantity <= 0:
            return make_response(jsonify({"erro": "Quantidade deve ser maior que zero."}), 400)

        if quantity > product.quantity:
            return make_response(jsonify({"erro": "Quantidade insuficiente em estoque."}), 400)

        sale = Sale(
            product_id=product.id,
            quantity=quantity,
            price_at_sale=product.price,
            seller_id=user.id,
        )
        product.quantity -= quantity
        db.session.add(sale)
        db.session.commit()

        return make_response(jsonify({"venda": sale.to_dict()}), 201)

    @staticmethod
    def list_sales():
        user = RequestAuth.get_current_user()
        if not user or user.status != "ATIVO":
            return make_response(jsonify({"erro": "Acesso não autorizado."}), 401)

        sales = Sale.query.filter_by(seller_id=user.id).order_by(Sale.created_at.desc()).all()
        return make_response(jsonify({"vendas": [s.to_dict() for s in sales]}), 200)

    @staticmethod
    def get_dashboard():
        user = RequestAuth.get_current_user()
        if not user or user.status != "ATIVO":
            return make_response(jsonify({"erro": "Acesso não autorizado."}), 401)

        products = Product.query.filter_by(seller_id=user.id).all()
        sales = Sale.query.filter_by(seller_id=user.id).all()

        total_products = len(products)
        total_sales = len(sales)
        total_revenue = sum(s.quantity * s.price_at_sale for s in sales)
        total_stock = sum(p.quantity for p in products)
        active_products = sum(1 for p in products if p.status == "Ativo")

        return make_response(jsonify({
            "totais": {
                "produtos": total_products,
                "produtos_ativos": active_products,
                "vendas": total_sales,
                "faturamento": float(total_revenue),
                "estoque_total": total_stock,
            }
        }), 200)

