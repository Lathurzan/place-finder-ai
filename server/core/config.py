from functools import lru_cache
import os

try:
    # Prefer the pydantic-settings v2 package when available
    from pydantic_settings import BaseSettings  # type: ignore
    PydanticSettings = True
except Exception:
    try:
        # Fall back to pydantic's BaseSettings (may be v1 or v2-compatible)
        from pydantic import BaseSettings  # type: ignore

        PydanticSettings = True
    except Exception:
        PydanticSettings = False

try:
    # dotenv is optional; load .env if present
    from dotenv import load_dotenv  # type: ignore

    load_dotenv()
except Exception:
    pass


if not PydanticSettings:
    # Minimal fallback settings object that reads from environment variables.
    class Settings:
        APP_NAME: str = os.getenv("APP_NAME", "Place Finder AI")
        DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

        ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")

        DATABASE_URL: str = os.getenv("DATABASE_URL", "")

        SECRET_KEY: str = os.getenv("SECRET_KEY", "")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
        OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")

        @property
        def allowed_origins_list(self) -> list[str]:
            return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


    @lru_cache()
    def get_settings() -> Settings:
        return Settings()


    settings = get_settings()
else:
    # Use pydantic/BaseSettings with a v2-compatible model_config.
    class Settings(BaseSettings):
        APP_NAME: str = "Place Finder AI"
        DEBUG: bool = True

        ALLOWED_ORIGINS: str = "http://localhost:3000"

        DATABASE_URL: str

        SECRET_KEY: str
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

        GEMINI_API_KEY: str
        OPENWEATHER_API_KEY: str

        # Pydantic v2 configuration must be provided via model_config dict.
        model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

        @property
        def allowed_origins_list(self) -> list[str]:
            return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


    @lru_cache()
    def get_settings() -> Settings:
        return Settings()


    settings = get_settings()