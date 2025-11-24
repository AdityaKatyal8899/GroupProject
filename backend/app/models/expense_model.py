from datetime import datetime


def now_utc():
    return datetime.utcnow()


def new_expense_document(user_id: str, data: dict) -> dict:
    """
    Shapes an expense document for MongoDB (no ORM).
    Fields:
      - user_id (str)
      - category (str)
      - amount (float)
      - description (optional str)
      - date (ISO string)
      - recovered_from_savings (bool)
      - created_at (datetime)
      - updated_at (datetime)
    """
    created = now_utc()
    return {
        "user_id": user_id,
        "category": data.get("category"),
        "amount": float(data.get("amount", 0)),
        "description": data.get("description", ""),
        "date": data.get("date"),  # ISO string expected
        "recovered_from_savings": bool(data.get("recovered_from_savings", False)),
        "created_at": created,
        "updated_at": created,
    }


def apply_expense_updates(doc: dict, updates: dict) -> dict:
    if "category" in updates:
        doc["category"] = updates["category"]

    if "amount" in updates:
        doc["amount"] = float(updates["amount"])

    if "description" in updates:
        doc["description"] = updates.get("description", "")

    if "date" in updates:
        doc["date"] = updates["date"]
    
    # If we decide later to modify recovery status
    if "recovered_from_savings" in updates:
        doc["recovered_from_savings"] = bool(updates["recovered_from_savings"])

    doc["updated_at"] = now_utc()
    return doc
