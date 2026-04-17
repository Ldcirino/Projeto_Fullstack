from flask import jsonify, make_response


class ProductController:
    @staticmethod
    def create_product():
        return make_response(jsonify({"erro": "Produtos ainda não implementados neste back end."}), 501)

    @staticmethod
    def list_products():
        return make_response(jsonify({"erro": "Produtos ainda não implementados neste back end."}), 501)

    @staticmethod
    def get_product(product_id: int):
        return make_response(jsonify({"erro": "Produtos ainda não implementados neste back end."}), 501)

    @staticmethod
    def update_product(product_id: int):
        return make_response(jsonify({"erro": "Produtos ainda não implementados neste back end."}), 501)

    @staticmethod
    def inactivate_product(product_id: int):
        return make_response(jsonify({"erro": "Produtos ainda não implementados neste back end."}), 501)

