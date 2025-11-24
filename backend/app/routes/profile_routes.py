from flask import Blueprint, request

from app.utils.response import success, error
from app.config import db

profile_bp = Blueprint("profile_bp", __name__, url_prefix="/api/profile")


@profile_bp.route("/update", methods=["POST"])
def update_profile():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    name = data.get("name")
    avatar = data.get("avatar")
    if not token:
        return error("token is required", 400)
    if name is None and avatar is None:
        return error("nothing to update", 400)

    # Optional fields we may persist if present
    email = data.get("email")

    update = {}
    if name is not None:
        update["name"] = name
    if avatar is not None:
        update["avatar"] = avatar
    if email is not None:
        update["email"] = email

    db.profiles.update_one({"token": token}, {"$set": update, "$setOnInsert": {"token": token}}, upsert=True)
    saved = db.profiles.find_one({"token": token}, {"_id": 0}) or {"token": token, **update}
    return success("Profile updated", saved, 200)
