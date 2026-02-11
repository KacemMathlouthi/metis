"""Main FastAPI application entry point.

This module creates and configures the FastAPI application instance,
sets up middleware, includes routers, and defines startup/shutdown events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    agents,
    analytics,
    auth,
    installations,
    issues,
    review_comments,
    webhooks,
)
from app.core.config import settings


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        debug=settings.debug,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
    app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
    app.include_router(installations.router, prefix="/api", tags=["Installations"])
    app.include_router(agents.router, prefix="/api", tags=["Agents"])
    app.include_router(issues.router, prefix="/api", tags=["Issues"])
    app.include_router(review_comments.router, prefix="/api", tags=["Review Comments"])
    app.include_router(analytics.router, prefix="/api", tags=["Analytics"])

    return app


# Create the app instance
app = create_application()


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {"name": settings.app_name, "version": settings.version, "status": "running"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "app": settings.app_name, "version": settings.version}
