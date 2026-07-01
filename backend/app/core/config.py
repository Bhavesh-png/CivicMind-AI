import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicMind AI"
    API_V1_STR: str = "/api/v1"
    
    # Google Cloud configurations
    GEMINI_API_KEY: str | None = None
    GCP_PROJECT_ID: str = "civicmind-ai-hackathon"
    GCP_LOCATION: str = "us-central1"
    
    # Mock settings
    # Default to true unless an API key or project ID is configured
    MOCK_GCP: bool = True
    
    # Local security for demo purposes
    SECRET_KEY: str = "supersecretcivicmindkeyforjwttoken"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day for hackathon convenience
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

# Check if we should override MOCK_GCP based on environment variables
if settings.GEMINI_API_KEY:
    settings.MOCK_GCP = False
