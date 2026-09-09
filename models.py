from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class BusStop(db.Model):
    __tablename__ = 'bus_stops'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    stop_name = db.Column(db.String(200), nullable=False)
    area = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    nearby_landmarks = db.Column(db.String(500), nullable=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    photo_url = db.Column(db.String(500), nullable=False)
    submitted_by = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<BusStop {self.stop_name}>'
