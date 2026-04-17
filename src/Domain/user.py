class UserDomain:
    def __init__(self, id, name, email, cnpj, celular):
        self.id = id
        self.name = name
        self.email = email
        self.cnpj = cnpj
        self.celular = celular

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "cnpj": self.cnpj,
            "celular": self.celular,
        }
