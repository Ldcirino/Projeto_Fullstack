class UserDomain:
    def __init__(self, id, name, email, cnpj, phone):
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
