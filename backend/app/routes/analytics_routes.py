from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from app.config import db


analytics_bp = Blueprint("analytics", __name__, url_prefix="/api")

def get_period_bounds(period):
    now = datetime.utcnow()
    
    if period == 'week':
        start = now - timedelta(days=7)

    if period == 'month':
        start = now - timedelta(days=30)

    if period == "year":
        year = now.year
        if (year % 400 == 0) or (year % 4 == 0 and year % 100 != 0):
            start = now - timedelta(days=366)
        else:
            start = now - timedelta(days=365)

    else:
        start = now - timedelta(days=30)

    return start


@analytics_bp.route('/analytics', methods=['GET'])
def analytics():
    try:
        token = request.args.get('token')
        chart_type = request.args.get('chart_type')
        period = request.args.get('period')

        if not token:
            return jsonify({'success': False, 'message': 'Token is missing'}), 404
        
        start_date = get_period_bounds(period)
        settings = db.settings.find_one({'token': token})
        income = settings.get('income', 0) if settings else 0
        budget = settings.get('budget', 0) if settings else 0

        expenses = list(
            db.expenses.aggregate([
                {"$match": {"token": token}},
                {"$addFields": {"parsed_date": {"$dateFromString": {"dateString": "$date"}}}},
                {"$match": {"parsed_date": {"$gte": start_date}}},
            ])
        )

        # ---------- AGGREGATE SAVINGS HISTORY ----------
        savings = list(
            db.savings.aggregate([
                {"$match": {"token": token}},
                {"$addFields": {"parsed_date": {"$dateFromString": {"dateString": "$date"}}}},
                {"$match": {"parsed_date": {"$gte": start_date}}},
            ])
        )

        # ---------- CALCULATE TOTALS ----------
        total_spent = sum(e.get("amount", 0) for e in expenses)
        total_saved = sum(s.get("amount", 0) for s in savings if s.get("type") == "add")
        total_used_savings = sum(s.get("amount", 0) for s in savings if s.get("type") == "use")
        current_savings = total_saved - total_used_savings
        remaining_budget = budget - total_spent

        # ---------- LINE CHART ----------
        if chart_type == "line":
            trend = {}

            for e in expenses:
                d = e["date"][:10]
                trend.setdefault(d, {"spent": 0, "saved": 0})
                trend[d]["spent"] += e["amount"]

            for s in savings:
                d = s["date"][:10]
                trend.setdefault(d, {"spent": 0, "saved": 0})
                if s["type"] == "add":
                    trend[d]["saved"] += s["amount"]
                elif s["type"] == "use":
                    trend[d]["saved"] -= s["amount"]

            trend_data = [
                {"date": k, "spent": v["spent"], "saved": v["saved"]}
                for k, v in sorted(trend.items())
            ]

            # ---------------- THRESHOLD COLOR ----------------
            spent_percent = (total_spent / budget * 100) if budget else 0
            if spent_percent < 50:
                status_color = "green"
            elif spent_percent < 75:
                status_color = "yellow"
            else:
                status_color = "red"

            return jsonify({
                "success": True,
                "mode": "line",
                "totals": {
                    "income": income,
                    "budget": budget,
                    "spent": total_spent,
                    "remaining": remaining_budget,
                    "savings": current_savings,
                    "status_color": status_color,
                },
                "trend": trend_data
            }), 200

        # ---------- PIE CHART ----------
        elif chart_type == "pie":
            categories = {}
            for e in expenses:
                cat = e.get("category", "Other")
                categories.setdefault(cat, 0)
                categories[cat] += e["amount"]

            pie_data = [{"category": k, "amount": v} for k, v in categories.items()]

            return jsonify({
                "success": True,
                "mode": "pie",
                "data": pie_data
            }), 200

        return jsonify({"success": False, "message": "Invalid type parameter"}), 400


    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
