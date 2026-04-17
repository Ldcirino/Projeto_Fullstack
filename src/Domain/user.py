class UserDomain:
<<<<<<< HEAD
    def __init__(self, id, name, email, cnpj, phone):
=======
    def __init__(self, id, name, email):
>>>>>>> 25bfe06 (Criação Front-end pagina de cadastro,autenticação e login)
        self.id = id
        self.name = name
        self.email = email
        self.cnpj = cnpj
        self.phone = phone

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "cnpj": self.cnpj,
            "phone": self.phone
        }
