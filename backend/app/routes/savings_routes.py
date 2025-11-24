from datetime import datetime

from flask import Blueprint, request, jsonify

from app.config import db


savings_routes = Blueprint("savings_routes", __name__, url_prefix="/api")


def _iso(dt):
    if isinstance(dt, datetime):
        return dt.isoformat()
    return dt


def _doc_to_dict(doc):
    out = dict(doc)
    if out.get("_id"):
        out["id"] = str(out.pop("_id"))
    if out.get("date"):
        out["date"] = _iso(out["date"])
    return out


@savings_routes.route("/savings/add", methods=["POST"])
def savings_add():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    amount = data.get("amount")
    note = data.get("note", "")

    if not token:
        return jsonify({"success": False, "message": "token is required"}), 400
    try:
        amount_val = float(amount)
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "amount must be a number"}), 400

    doc = {
        "token": token,
        "amount": amount_val,
        "type": "add",
        "note": note,
        "date": datetime.utcnow(),
    }
    res = db.savings.insert_one(doc)
    saved = db.savings.find_one({"_id": res.inserted_id})
    return jsonify({"success": True, "message": "Saving added", "data": _doc_to_dict(saved)}), 201


@savings_routes.route("/savings/use", methods=["POST"])
def savings_use():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    amount = data.get("amount")
    note = data.get("note", "")
    category = data.get("category", "Misc")
    description = data.get("description", "")

    if not token:
        return jsonify({"success": False, "message": "token is required"}), 400
    try:
        amount_val = float(amount)
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "amount must be a number"}), 400

    # Add record to savings ledger
    saving_doc = {
        "token": token,
        "amount": amount_val,
        "type": "use",
        "note": note,
        "date": datetime.utcnow(),
    }
    res = db.savings.insert_one(saving_doc)

    # Add record into expenses with recovered flag
    expense_doc = {
        "token": token,
        "amount": amount_val,
        "category": category,
        "description": description,
        "recovered_from_savings": True,
        "date": datetime.utcnow(),
    }
    db.expenses.insert_one(expense_doc)

    saved = db.savings.find_one({"_id": res.inserted_id})
    return jsonify({"success": True, "message": "Saving used and expense recorded", "data": _doc_to_dict(saved)}), 201



@savings_routes.route("/savings/get", methods=["GET"])
def savings_get():
    token = request.args.get("token")
    if not token:
        return jsonify({"success": False, "message": "token is required"}), 400
    cursor = db.savings.find({"token": token}).sort("date", -1)
    items = [_doc_to_dict(d) for d in cursor]
    return jsonify({"success": True, "message": "Savings fetched", "data": items}), 200


@savings_routes.route("/savings/summary", methods=["GET"])
def savings_summary():
    token = request.args.get("token")
    if not token:
        return jsonify({"success": False, "message": "token is required"}), 400
    cursor = db.savings.find({"token": token})
    total_added = 0.0
    total_used = 0.0
    for d in cursor:
        amt = float(d.get("amount") or 0)
        if d.get("type") == "add":
            total_added += amt
        elif d.get("type") == "use":
            total_used += amt
    current = total_added - total_used
    return jsonify({
        "success": True,
        "message": "Summary fetched",
        "data": {
            "total_added": total_added,
            "total_used": total_used,
            "current_savings": current,
        },
    }), 200

