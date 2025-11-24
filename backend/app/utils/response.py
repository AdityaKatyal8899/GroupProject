from flask import jsonify


def success(message: str, data=None, code: int = 200):
    payload = {"success": True, "message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload), code


def error(message: str, code: int = 400, data=None):
    payload = {"success": False, "message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload), code

