from flask import Flask, send_from_directory
from flask_cors import CORS
import os

from src.config.data_base import init_db
from src.routes import init_routes
from dotenv import load_dotenv

load_dotenv(override=True)

def create_app():
    """
    Função que cria e configura a aplicação Flask.
    """

    app = Flask(
        __name__,
        static_folder="frontend",
        static_url_path="",
        template_folder="frontend",
    )

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key-change-me")

    # =========================
    # CONFIG UPLOAD
    # =========================

    upload_folder = os.path.join(os.getcwd(), "uploads/products")

    os.makedirs(upload_folder, exist_ok=True)

    app.config["UPLOAD_FOLDER"] = upload_folder

    # =========================

    init_db(app)

    init_routes(app)

    # =========================
    # SERVIR IMAGENS
    # =========================

    @app.route('/uploads/products/<filename>')
    def uploaded_file(filename):
        return send_from_directory(
            app.config['UPLOAD_FOLDER'],
            filename
        )

    # =========================

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True)