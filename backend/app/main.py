"""Main entry point for the FastAPI application."""

from typing import Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    app = FastAPI(
        title="Mario Analytics API",
        version="0.1.0",
        description="Backend API for the Mario Analytics platformer game.",
    )

    # Allowed CORS origins
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register API routers
    app.include_router(auth.router, prefix="/auth", tags=["Auth"])

    @app.get("/health", tags=["Health"])
    def get_health() -> Dict[str, str]:
        """Health check endpoint to verify backend service availability."""
        return {"status": "ok"}

    return app


app = create_app()
