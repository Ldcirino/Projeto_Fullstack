from src.config.data_base import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
<<<<<<< HEAD
    cnpj = db.Column(db.String(14), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
=======
    cnpj = db.Column(db.String(32), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    celular = db.Column(db.String(32), unique=True, nullable=False)
>>>>>>> 25bfe06 (Criação Front-end pagina de cadastro,autenticação e login)
    password = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(16), nullable=False, default="INATIVO")
    activation_code = db.Column(db.String(8), nullable=True)

    status = db.Column(db.String(20), default="INATIVO")
    activation_code = db.Column(db.String(4))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "cnpj": self.cnpj,
            "email": self.email,
<<<<<<< HEAD
            "phone": self.phone,
            "status": self.status
        }
=======
            "celular": self.celular,
            "status": self.status,
        }
>>>>>>> 25bfe06 (Criação Front-end pagina de cadastro,autenticação e login)
