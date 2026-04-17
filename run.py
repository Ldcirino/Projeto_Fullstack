from flask import Flask
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

    init_db(app)

    init_routes(app)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
