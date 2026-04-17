from datetime import datetime
from src.config.data_base import db
from src.Infrastructure.Model.product import Product

class Sale(db.Model):
    __tablename__ = 'sales'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_sale = db.Column(db.Float, nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        product = Product.query.get(self.product_id)
        return {
            'id': self.id,
            'product_id': self.product_id,
            'produto': product.to_dict() if product else None,
            'quantity': self.quantity,
            'price_at_sale': float(self.price_at_sale),
            'seller_id': self.seller_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
