from flask import Blueprint, request, jsonify

from app.config import db

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/reset", methods=["POST"])
def reset_user_data():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    if not token:
        return jsonify({"success": False, "message": "token is required"}), 400

    # Expenses use user_id field, savings/settings use token field
    exp_result = db.expenses.delete_many({"user_id": token})
    sav_result = db.savings.delete_many({"token": token})
    set_result = db.settings.delete_many({"token": token})

    return jsonify({
        "success": True,
        "message": "User data reset",
        "data": {
            "deleted_expenses": exp_result.deleted_count,
            "deleted_savings": sav_result.deleted_count,
            "deleted_settings": set_result.deleted_count,
        },
    }), 200
