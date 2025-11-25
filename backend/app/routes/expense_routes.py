from flask import Blueprint, request
from datetime import datetime, timedelta, timezone

from app.utils.response import success, error
from app.services.expense_service import (
    add_expense,
    get_expenses,
    update_expense,
    delete_expense,
)
from app.config import db


expense_routes = Blueprint("expense_routes", __name__, url_prefix="/api/expenses")


@expense_routes.route("/add", methods=["POST"])
def add():
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    if not token:
        return error("token is required", 400)
    saved, err = add_expense(token, data)
    if err:
        return error(err, 400)
    return success("Expense added", saved, 201)


@expense_routes.route("/list", methods=["GET"])
def list_expenses():
    token = request.args.get("token")
    if not token:
        return error("token is required", 400)
    items = get_expenses(token)
    return success("Expenses fetched", items, 200)


@expense_routes.route("/update/<expense_id>", methods=["PUT"])
def update(expense_id):
    data = request.get_json(silent=True) or {}
    token = data.get("token")
    if not token:
        return error("token is required", 400)
    saved, err = update_expense(token, expense_id, data)
    if err:
        code = 404 if err == "Expense not found" else 400
        return error(err, code)
    return success("Expense updated", saved, 200)


@expense_routes.route("/delete/<expense_id>", methods=["DELETE"])
def delete(expense_id):
    token = request.args.get("token") or (request.get_json(silent=True) or {}).get("token")
    if not token:
        return error("token is required", 400)
    ok, err = delete_expense(token, expense_id)
    if not ok:
        code = 404 if err == "Expense not found" else 400
        return error(err, code)
    return success("Expense deleted", None, 200)


@expense_routes.route("/summary", methods=["GET"])
def summary():
    """Return per-category totals and percentage of budget for a user and period.

    Query params:
    - token: user token (required)
    - period: week|month|year (default: week)
    """
    token = request.args.get("token")
    period = (request.args.get("period") or "week").lower()
    if not token:
        return error("token is required", 400)

    # Determine time window
    now = datetime.now(timezone.utc)
    if period == "year":
        start = now - timedelta(days=365)
    elif period == "month":
        start = now - timedelta(days=30)
    else:
        start = now - timedelta(days=7)

    # Fetch user's budget from settings
    settings = db.settings.find_one({"token": token}, {"_id": 0, "budget": 1}) or {}
    budget = settings.get("budget") or 0
    try:
        budget = float(budget)
    except Exception:
        budget = 0.0

    # Build query: by token, exclude recovered/paidFromSavings entries, and within period
    q = {"token": token}
    # Exclude paidFromSavings=true if present
    q["$or"] = [{"paidFromSavings": {"$exists": False}}, {"paidFromSavings": False}]

    # Date filtering: try created_at; fall back to string date field if available
    q_time = {"created_at": {"$gte": start}}
    # Some documents might store date as 'YYYY-MM-DD'
    # We'll also allow those by OR-ing a string compare if present
    date_str = start.date().isoformat()
    q_date_str = {"date": {"$gte": date_str}}

    # Combine: created_at OR date string greater than start
    q["$and"] = [{"$or": [q_time, q_date_str]}]

    cursor = db.expenses.find(q, {"_id": 0, "category": 1, "amount": 1})

    totals = {}
    for doc in cursor:
        try:
            amt = float(doc.get("amount") or 0)
        except Exception:
            amt = 0.0
        if amt <= 0:
            continue
        cat = doc.get("category") or "Other"
        totals[cat] = totals.get(cat, 0.0) + amt

    items = []
    for cat, total in totals.items():
        pct = 0.0
        if budget and budget > 0:
            pct = min(100.0, (total / float(budget)) * 100.0)
        items.append({
            "category": cat,
            "amount": round(float(total), 2),
            "percent": round(pct, 2),
        })

    # Sort by percent desc
    items.sort(key=lambda x: x["percent"], reverse=True)

    payload = {"items": items, "totalBudget": round(float(budget), 2)}
    return success("Summary fetched", payload, 200)

