from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.api import auth, data, prediction, chatbot, reports, feedback, notifications

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Decision Intelligence Platform for Smarter Cities",
    version="1.0.0"
)

# Custom Security Headers Middleware for production-ready setups
class SecurityHeaderMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Content Security Policy: Allows self-origin, OpenStreetMap tiles, and public Google Fonts
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://*.openstreetmap.org; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https://*.openstreetmap.org https://unpkg.com; "
            "connect-src 'self' ws://localhost:* http://localhost:* https://*.googleapis.com;"
        )
        # Anti-clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # MIME sniff prevention
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Referrer tracking control
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Sandbox browser permissions (only geolocation is active for map features)
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(self)"
        return response

# Register Middleware layers
app.add_middleware(SecurityHeaderMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for hackathon simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(data.router, prefix=settings.API_V1_STR)
app.include_router(prediction.router, prefix=settings.API_V1_STR)
app.include_router(chatbot.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "tagline": "Turning Community Data into Smart Decisions",
        "version": "1.0.0",
        "status": "Online",
        "docs_url": "/docs",
        "mock_mode": settings.MOCK_GCP
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
