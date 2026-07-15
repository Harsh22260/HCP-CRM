from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "gemma2-9b-it"
    GROQ_MODEL_FALLBACK: str = "llama-3.3-70b-versatile"

    DATABASE_URL: str = "sqlite:///./hcp_crm.db"  # safe local fallback
    APP_ENV: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]


settings = Settings()
