from flask import Flask
from flask_cors import CORS
from .config import init_config

def create_app():
    app = Flask(__name__)
    # Allow specific frontend origins for API routes with credentials support
    CORS(
        app,
        supports_credentials=True,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "https://myexpensetracker-six.vercel.app",
                ]
            }
        },
    )

    init_config(app)

    # Register API blueprints
    try:
        from app.routes.main_routes import main_routes
        app.register_blueprint(main_routes)

        from app.routes.expense_routes import expense_routes
        app.register_blueprint(expense_routes)

        from app.routes.savings_routes import savings_routes
        app.register_blueprint(savings_routes)

        from app.routes.settings_routes import settings_bp
        app.register_blueprint(settings_bp)

        from app.routes.admin_routes import admin_bp
        app.register_blueprint(admin_bp)

        from app.routes.profile_routes import profile_bp
        app.register_blueprint(profile_bp)

        # Legacy auth (token POST) can remain registered or be omitted; new conventional flow below
        try:
            from app.routes.auth_routes import auth_bp
            app.register_blueprint(auth_bp)
        except Exception:
            pass

        # Conventional OAuth2 Authorization Code Flow
        from app.auth.google_auth import google_auth_bp
        app.register_blueprint(google_auth_bp)
    except Exception:
        # If routes not available during certain scripts, skip registration
        pass
    return app
