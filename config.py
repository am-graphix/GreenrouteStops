import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

    # Neon Postgres (or any Postgres URL)
    # Neon gives you a URL like: postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///bus_stops.db'  # fallback for local testing only
    )
    # Render sometimes gives postgres:// — SQLAlchemy needs postgresql://
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith('postgres://'):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace('postgres://', 'postgresql://', 1)

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Cloudinary configuration
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

    # Hardcoded team members (username: password)
    TEAM_MEMBERS = {
        'am': 'passwordispassword1',
        'andrews': 'passwordispassword2',
        'derrick': 'passwordispassword3',
        'justice': 'passwordispassword4',
        'leslie': 'passwordispassword5',
        'divine': 'passwordispassword6',
        'samuel': 'passwordispassword7',
        'emmanuel': 'passwordispassword8',
        'joshua': 'passwordispassword9'
    }
