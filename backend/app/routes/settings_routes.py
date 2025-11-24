from flask import Blueprint, request, jsonify
from datetime import datetime

from app.config import db


settings_bp = Blueprint("settings", __name__, url_prefix="/api")


@settings_bp.route("/settings/save", methods=["POST"])
def save_settings():
    try:
        data = request.get_json(silent=True) or {}
        token = data.get("token")
        income = data.get("income")
        budget = data.get("budget")
        notifications = data.get("notifications")

        if not token:
            return jsonify({"success": False, "message": "token is required"}), 400

        settings_collection = db.settings

        settings_collection.update_one(
            {"token": token},
            {
                "$set": {
                    "income": income,
                    "budget": budget,
                    "notifications": notifications,
                    "updated_at": datetime.utcnow(),
                }
            },
            upsert=True,
        )

        return jsonify({"success": True, "message": "Settings updated successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@settings_bp.route("/settings/get", methods=["GET"])
def get_settings():
    try:
        token = request.args.get("token")
        if not token:
            return jsonify({"success": False, "message": "token is required"}), 400

        settings_collection = db.settings
        record = settings_collection.find_one({"token": token}, {"_id": 0})

        if not record:
            return jsonify({
                "success": True,
                "data": {
                    "income": None,
                    "budget": None,
                    "notifications": {"budgetAlert": False, "largeExpense": False, "monthlyEmail": False},
                },
            }), 200

        return jsonify({"success": True, "data": record}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
