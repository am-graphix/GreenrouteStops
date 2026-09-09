import os
from datetime import datetime, timedelta
from flask import (
    Flask, render_template, request, redirect,
    url_for, session, flash
)
from flask_sqlalchemy import SQLAlchemy
import cloudinary
import cloudinary.uploader
from config import Config
from models import db, BusStop

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)

# Configure Cloudinary
cloudinary.config(
    cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
    api_key=app.config['CLOUDINARY_API_KEY'],
    api_secret=app.config['CLOUDINARY_API_SECRET']
)


def login_required(f):
    """Decorator to require login for protected routes."""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


@app.route('/')
def index():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        users = app.config['TEAM_MEMBERS']
        if username in users and users[username] == password:
            session['user'] = username
            return redirect(url_for('dashboard'))
        flash('Invalid username or password')
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))


@app.route('/dashboard', methods=['GET', 'POST'])
@login_required
def dashboard():
    username = session['user']

    if request.method == 'POST':
        stop_name = request.form.get('stop_name', '').strip()
        area = request.form.get('area', '').strip()
        city = request.form.get('city', '').strip()
        nearby_landmarks = request.form.get('nearby_landmarks', '').strip() or None
        latitude = request.form.get('latitude', '').strip()
        longitude = request.form.get('longitude', '').strip()
        submitted_by = request.form.get('submitted_by', '').strip() or username
        photo_file = request.files.get('photo')

        # Basic server-side validation
        if not all([stop_name, area, city, latitude, longitude, submitted_by, photo_file]):
            flash('Please fill in all required fields and capture location + photo.', 'error')
            return redirect(url_for('dashboard'))

        try:
            lat = round(float(latitude), 8)
            lng = round(float(longitude), 8)
        except ValueError:
            flash('Invalid GPS coordinates.', 'error')
            return redirect(url_for('dashboard'))

        # Upload photo to Cloudinary
        try:
            upload_result = cloudinary.uploader.upload(photo_file)
            photo_url = upload_result['secure_url']
        except Exception as e:
            flash(f'Photo upload failed: {str(e)}', 'error')
            return redirect(url_for('dashboard'))

        # Save to database
        new_stop = BusStop(
            stop_name=stop_name,
            area=area,
            city=city,
            nearby_landmarks=nearby_landmarks,
            latitude=lat,
            longitude=lng,
            photo_url=photo_url,
            submitted_by=submitted_by
        )
        db.session.add(new_stop)
        db.session.commit()

        flash('Bus stop added successfully!', 'success')
        return redirect(url_for('dashboard'))

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    stops_today = BusStop.query.filter(
        BusStop.submitted_by == username,
        BusStop.created_at >= today_start
    ).count()

    return render_template(
        'dashboard.html',
        username=username,
        stops_today=stops_today
    )


@app.route('/stops')
@login_required
def view_stops():
    stops = BusStop.query.order_by(BusStop.created_at.desc()).all()

    total_stops = len(stops)
    stops_by_city = {}
    for stop in stops:
        stops_by_city[stop.city] = stops_by_city.get(stop.city, 0) + 1

    today = datetime.utcnow().date()
    this_week = datetime.utcnow() - timedelta(days=7)
    stops_today = sum(1 for s in stops if s.created_at.date() == today)
    stops_this_week = sum(1 for s in stops if s.created_at >= this_week)

    contributors = {}
    for stop in stops:
        contributors[stop.submitted_by] = contributors.get(stop.submitted_by, 0) + 1
    top_contributor = max(contributors, key=contributors.get) if contributors else "None"
    top_contributor_count = contributors.get(top_contributor, 0)

    return render_template(
        'view_stops.html',
        stops=stops,
        total_stops=total_stops,
        stops_by_city=stops_by_city,
        stops_today=stops_today,
        stops_this_week=stops_this_week,
        top_contributor=top_contributor,
        top_contributor_count=top_contributor_count
    )


@app.cli.command('init-db')
def init_db():
    """Initialize the database tables."""
    with app.app_context():
        db.create_all()
        print('Database initialized successfully.')


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
