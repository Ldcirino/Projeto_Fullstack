from flask import jsonify, make_response


class SaleController:
    @staticmethod
    def create_sale():
        return make_response(jsonify({"erro": "Vendas ainda não implementadas neste back end."}), 501)

    @staticmethod
    def list_sales():
        return make_response(jsonify({"erro": "Vendas ainda não implementadas neste back end."}), 501)

    @staticmethod
    def get_dashboard():
        return make_response(jsonify({"erro": "Dashboard ainda não implementado neste back end."}), 501)

