from datetime import datetime
from bson import ObjectId

from app.config import db  # provided by project config
from app.utils.validators import validate_expense_data
from app.models.expense_model import new_expense_document, apply_expense_updates


USER_ID = "test_user_123"


def _serialize(exp):
    if not exp:
        return None
    out = dict(exp)
    # Convert Mongo fields
    if out.get("_id"):
        out["id"] = str(out.pop("_id"))
    # Convert datetimes
    for k in ("created_at", "updated_at"):
        if isinstance(out.get(k), datetime):
            out[k] = out[k].isoformat()
    return out


def add_expense(data: dict):
    ok, err = validate_expense_data(data)
    if not ok:
        return None, err

    doc = new_expense_document(USER_ID, data)
    inserted = db.expenses.insert_one(doc)
    saved = db.expenses.find_one({"_id": inserted.inserted_id})
    return _serialize(saved), None


def get_expenses(user_id: str = USER_ID):
    cursor = db.expenses.find({"user_id": user_id}).sort("created_at", -1)
    return [_serialize(e) for e in cursor]


def update_expense(expense_id: str, data: dict):
    # Validate fields if provided
    # We perform a partial validation: only validate fields present
    partial = {}
    for key in ("category", "amount", "description", "date"):
        if key in data:
            partial[key] = data[key]
    if partial:
        # Build a temp dict merging existing doc for validation completeness
        # Fetch existing
        try:
            existing = db.expenses.find_one({"_id": ObjectId(expense_id), "user_id": USER_ID})
        except Exception:
            existing = None
        if not existing:
            return None, "Expense not found"
        temp = {**existing, **partial}
        # Convert amount to provided type if needed for validation
        ok, err = validate_expense_data({
            "category": temp.get("category"),
            "amount": temp.get("amount"),
            "description": temp.get("description", ""),
            "date": temp.get("date"),
        })
        if not ok:
            return None, err

        # Apply updates and persist
        updated_doc = apply_expense_updates(existing, partial)
        db.expenses.update_one({"_id": existing["_id"]}, {"$set": updated_doc})
        saved = db.expenses.find_one({"_id": existing["_id"]})
        return _serialize(saved), None
    else:
        return None, "No valid fields to update"


def delete_expense(expense_id: str):
    try:
        res = db.expenses.delete_one({"_id": ObjectId(expense_id), "user_id": USER_ID})
    except Exception:
        return False, "Invalid expense id"
    if res.deleted_count == 0:
        return False, "Expense not found"
    return True, None

