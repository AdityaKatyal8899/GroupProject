from datetime import datetime

def validate_expense_data(data: dict):
    if not isinstance(data, dict):
        return False, "Invalid payload"

    category = data.get("category")
    amount = data.get("amount")
    date = data.get("date")

    if not category or not isinstance(category, str):
        return False, "'category' is required and must be a string"
    try:
        amount_val = float(amount)
    except (TypeError, ValueError):
        return False, "'amount' is required and must be a number"
    if amount_val < 0:
        return False, "'amount' must be >= 0"

    if not date or not isinstance(date, str):
        return False, "'date' is required and must be an ISO string"

    try:

        if 'T' in date:
            datetime.fromisoformat(date.replace('Z', '+00:00'))
        else:
            datetime.fromisoformat(date)
    except Exception:
        return False, "'date' must be an ISO format string"

    # Optional description
    desc = data.get("description")
    if desc is not None and not isinstance(desc, str):
        return False, "'description' must be a string if provided"

    return True, None

