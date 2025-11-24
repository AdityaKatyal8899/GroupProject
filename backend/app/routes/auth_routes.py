from flask import Blueprint, request, jsonify
from google.oauth2 import id_token
from google.auth.transport import requests
from app.config import db, GOOGLE_CLIENT_ID
import uuid
from datetime import datetime


auth_bp = Blueprint('auth_bp', __name__ , url_prefix='/api')


@auth_bp.route("/auth/google", methods=['POST'])
def google_auth():
    try:
        data = request.json or {}
        credential = data.get('credential')

        if not credential:
            return jsonify({'success': False, 'message': 'missing creds'}), 404
        
        google_user = id_token.verify_oauth2_token(
        credential,
        requests.Request(),
        GOOGLE_CLIENT_ID
        )
        email = google_user.get("email")
        name = google_user.get("name")
        avatar = google_user.get("picture")

        if not email:
            return jsonify({"success": False, "message": "Could not extract Google email"}), 400

        users = db.users

        # Lookup if already exists
        record = users.find_one({"email": email})

        if record:
            token = record["token"]
        else:
            token = uuid.uuid4().hex
            users.insert_one({
                "email": email,
                "name": name,
                "avatar": avatar,
                "token": token,
                "created_at": datetime.utcnow()
            })

        # Update last login
        users.update_one({"token": token}, {"$set": {"last_login": datetime.utcnow()}})

        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": token,
            "name": name,
            "email": email,
            "avatar": avatar
        }), 200


    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@auth_bp.route('/auth/login', methods=['POST'])
def auth_login():
    """Finalize login after OAuth callback by upserting a user by google_id.

    Expects JSON body:
    {
      google_id: str,
      name: str,
      email: str,
      picture: str,
      token: str (optional legacy field; ignored for new access_token generation)
    }
    """
    data = request.get_json(silent=True) or {}
    google_id_val = data.get('google_id')
    name = data.get('name')
    email = data.get('email')
    picture = data.get('picture')

    if not google_id_val or not name or not email or not picture:
        return jsonify({'success': False, 'message': 'missing login details'}), 400

    # Ensure unique index on google_id
    try:
        db.users.create_index('google_id', unique=True)
    except Exception:
        pass

    users = db.users
    existing = users.find_one({'google_id': google_id_val})

    now = datetime.utcnow()
    if existing:
        access_token = existing.get('access_token')
        if not access_token:
            access_token = f"u_{uuid.uuid4().hex}"
            users.update_one({'google_id': google_id_val}, {'$set': {'access_token': access_token}})
        # Update only last_login for existing users
        users.update_one({'google_id': google_id_val}, {'$set': {'last_login': now}})
        # Return existing profile fields (do not mutate name/email/picture here)
        resp_name = existing.get('name', name)
        resp_email = existing.get('email', email)
        resp_picture = existing.get('picture', picture)
    else:
        access_token = f"u_{uuid.uuid4().hex}"
        users.insert_one({
            'google_id': google_id_val,
            'access_token': access_token,
            'name': name,
            'email': email,
            'picture': picture,
            'created_at': now,
            'last_login': now,
        })
        resp_name = name
        resp_email = email
        resp_picture = picture

    payload = {
        'success': True,
        'access_token': access_token,
        'name': resp_name,
        'email': resp_email,
        'picture': resp_picture,
    }
    return jsonify(payload), 200