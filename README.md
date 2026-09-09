# Green Route Bus Stop Collector

Private internal web tool for logging trotro bus stops across Ghana.  
Built with Flask + SQLite + Cloudinary. Pure HTML/CSS/JS frontend. Designed for mobile use in the field.

## Features

- Hardcoded team login (no registration)
- Submit bus stops with GPS capture (8 decimal places) and camera photo
- Photos uploaded to Cloudinary; URL stored in SQLite
- View all stops with analytics, real-time search, and photo lightbox
- Fully mobile-friendly

## Quick Start (Local)

1. **Clone / unzip** this project and enter the folder:
   ```bash
   cd green_route_collector
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in:
   - `SECRET_KEY` — any long random string
   - Cloudinary credentials (free tier works):  
     https://cloudinary.com → Dashboard → copy Cloud Name, API Key, API Secret

5. **Run the app**:
   ```bash
   python app.py
   ```
   Open http://127.0.0.1:5000

6. **Login** with any of the team accounts defined in `config.py`  
   Example: username `am` / password `password1`

## Deploy to PythonAnywhere (Free Tier)

1. Upload the project (or clone from git).
2. Create a web app (Manual configuration, Python 3.x).
3. In the Virtualenv section, create/set a virtualenv and install:
   ```bash
   pip install -r requirements.txt
   ```
4. Set the WSGI file to point to your `app.py` (PythonAnywhere docs cover this).
5. Add environment variables in the Web tab → Environment variables, **or** keep a `.env` file (ensure `python-dotenv` loads it).
6. Make sure the `instance/` folder is writable so SQLite can create `bus_stops.db`.
7. Reload the web app.

## Project Structure

```
green_route_collector/
├── app.py              # Flask routes & logic
├── config.py           # Config + TEAM_MEMBERS dict
├── models.py           # SQLAlchemy BusStop model
├── requirements.txt
├── .env.example
├── static/
│   ├── css/style.css
│   └── js/main.js
├── templates/
│   ├── base.html
│   ├── login.html
│   ├── dashboard.html
│   └── view_stops.html
└── instance/           # SQLite DB created here at runtime
```

## Logo Placeholder

Search the templates for:

```html
<!-- PLACEHOLDER: Replace src with your Green Route logo URL -->
```

Uncomment the `<img>` tags and set your logo URL (or upload a local image under `static/` and use `url_for('static', filename='...')`).

## Changing Team Members / Passwords

Edit the `TEAM_MEMBERS` dictionary in `config.py`.

## License

Internal tool — not for public distribution.
