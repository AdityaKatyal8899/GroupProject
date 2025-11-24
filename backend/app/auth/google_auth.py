import os
from urllib.parse import urlencode
from flask import Blueprint, redirect, request
import requests
from app.config import db
import uuid
from datetime import datetime


google_auth_bp = Blueprint('google_auth_bp', __name__, url_prefix='/api/auth/google')

GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'


def _get_env(name, default=None):
    val = os.getenv(name)
    return val if val is not None else default


@google_auth_bp.route('/login', methods=['GET'])
def login():
    client_id = _get_env('GOOGLE_CLIENT_ID')
    redirect_uri = _get_env('GOOGLE_REDIRECT_URI')
    if not client_id or not redirect_uri:
        # Fail fast to aid setup
        return (
            'Missing GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI in environment',
            500,
        )
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'offline',
        'include_granted_scopes': 'true',
        'prompt': 'select_account',
    }
    url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    return redirect(url, code=302)


@google_auth_bp.route('/callback', methods=['GET'])
def callback():
    code = request.args.get('code')
    if not code:
        return ('Missing authorization code', 400)

    client_id = _get_env('GOOGLE_CLIENT_ID')
    client_secret = _get_env('GOOGLE_CLIENT_SECRET')
    redirect_uri = _get_env('GOOGLE_REDIRECT_URI')
    if not client_id or not client_secret or not redirect_uri:
        return ('Missing Google OAuth env vars', 500)

    # Exchange code for tokens
    data = {
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }
    token_resp = requests.post(GOOGLE_TOKEN_URL, data=data, timeout=15)
    if token_resp.status_code != 200:
        try:
            body = token_resp.json()
        except Exception:
            body = {'error': token_resp.text}
        return (f"Failed to exchange code: {body}", 400)

    tokens = token_resp.json() or {}
    access_token = tokens.get('access_token')
    if not access_token:
        return ('Missing access_token in token response', 400)

    # Fetch profile
    ui_resp = requests.get(
        GOOGLE_USERINFO_URL,
        headers={'Authorization': f'Bearer {access_token}'},
        timeout=15,
    )
    if ui_resp.status_code != 200:
        try:
            body = ui_resp.json()
        except Exception:
            body = {'error': ui_resp.text}
        return (f"Failed fetching userinfo: {body}", 400)

    profile = ui_resp.json() or {}
    email = profile.get('email')
    name = profile.get('name') or profile.get('given_name') or ''
    picture = profile.get('picture') or ''
    # Google unique ID can be 'sub' (OpenID) or 'id' (userinfo v2)
    google_id = profile.get('sub') or profile.get('id') or ''

    if not email:
        return ('Email not available from Google profile', 400)

    # Ensure unique index on google_id
    try:
        db.users.create_index('google_id', unique=True)
    except Exception:
        pass

    # Upsert user by google_id and manage access_token
    users = db.users
    record = users.find_one({'google_id': google_id})
    now = datetime.utcnow()
    if record:
        access_token = record.get('access_token') or f"u_{uuid.uuid4().hex}"
        # Update only last_login
        users.update_one({'google_id': google_id}, {'$set': {'last_login': now}})
    else:
        access_token = f"u_{uuid.uuid4().hex}"
        users.insert_one({
            'google_id': google_id,
            'access_token': access_token,
            'name': name,
            'email': email,
            'picture': picture,
            'created_at': now,
            'last_login': now,
        })

    # Redirect to frontend success handler
    params = urlencode({
        'access_token': access_token,
        'name': name or '',
        'email': email or '',
        'picture': picture or '',
        'google_id': google_id or '',
    })
    frontend_success = _get_env('FRONTEND_LOGIN_SUCCESS_URL', 'http://localhost:5173/login/success')
    return redirect(f"{frontend_success}?{params}", code=302)
