from flask import Blueprint, jsonify

main_routes = Blueprint("main_routes", __name__)

@main_routes.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "OK",
        "message": "Expense Tracker Backend is running successfully 🚀"
    }), 200
