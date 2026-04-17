from flask import request, jsonify, make_response
from src.Application.Service.auth_request import RequestAuth
from src.config.data_base import db
from src.Infrastructure.Model.product import Product


class ProductController:
    @staticmethod
    def create_product():
        user = RequestAuth.get_current_user()
        if not user or user.status != "ATIVO":
            return make_response(jsonify({"erro": "Acesso não autorizado."}), 401)

        data = request.get_json() or {}
        name = data.get("name")
        price = data.get("price")
        quantity = data.get("quantity")
        status = data.get("status") or "Ativo"
        img = data.get("img")

        if not name or price is None or quantity is None:
            return make_response(jsonify({"erro": "Campos obrigatórios faltando."}), 400)

        try:
            price = float(price)
            quantity = int(quantity)
        except (ValueError, TypeError):
            return make_response(jsonify({"erro": "Preço ou quantidade inválidos."}), 400)

        product = Product(
            name=name.strip(),
            price=price,
            quantity=quantity,
            status=status.strip(),
            img=img.strip() if isinstance(img, str) else None,
            seller_id=user.id,
        )
        db.session.add(product)
        db.session.commit()

        return make_response(jsonify({"produto": product.to_dict()}), 201)

    @staticmethod
    def list_products():
        user = RequestAuth.get_current_user()
        if not user or user.status != "ATIVO":
            return make_response(jsonify({"erro": "Acesso não autorizado."}), 401)

        products = Product.query.filter_by(seller_id=user.id).all()
        return make_response(jsonify({"produtos": [p.to_dict() for p in products]}), 200)

    @staticmethod
    def get_product(product_id: int):
        user = RequestAuth.get_current_user()
        if not user or user.status != "ATIVO":
            return make_response(jsonify({"erro": "Acesso não autorizado."}), 401)

        product = Product.query.filter_by(id=product_id, seller_id=user.id).first()
        if not product:
            return make_response(jsonify({"erro": "Produto não encontrado."}), 404)

        return make_response(jsonify({"produto": product.to_dict()}), 200)

    @staticmethod
    def update_product(product_id: int):
        user = RequestAuth.get_current_user()
        if not user or user.status != "ATIVO":
            return make_response(jsonify({"erro": "Acesso não autorizado."}), 401)

        product = Product.query.filter_by(id=product_id, seller_id=user.id).first()
        if not product:
            return make_response(jsonify({"erro": "Produto não encontrado."}), 404)

        data = request.get_json() or {}
        if "name" in data and data.get("name"):
            product.name = data.get("name").strip()
        if "price" in data and data.get("price") is not None:
            try:
                product.price = float(data.get("price"))
            except (ValueError, TypeError):
                return make_response(jsonify({"erro": "Preço inválido."}), 400)
        if "quantity" in data and data.get("quantity") is not None:
            try:
                product.quantity = int(data.get("quantity"))
            except (ValueError, TypeError):
                return make_response(jsonify({"erro": "Quantidade inválida."}), 400)
        if "status" in data and data.get("status"):
            product.status = data.get("status").strip()
        if "img" in data:
            product.img = data.get("img").strip() if isinstance(data.get("img"), str) else None

        db.session.commit()
        return make_response(jsonify({"produto": product.to_dict()}), 200)

    @staticmethod
    def inactivate_product(product_id: int):
        user = RequestAuth.get_current_user()
        if not user or user.status != "ATIVO":
            return make_response(jsonify({"erro": "Acesso não autorizado."}), 401)

        product = Product.query.filter_by(id=product_id, seller_id=user.id).first()
        if not product:
            return make_response(jsonify({"erro": "Produto não encontrado."}), 404)

        product.status = "Inativo"
        db.session.commit()
        return make_response(jsonify({"produto": product.to_dict()}), 200)

