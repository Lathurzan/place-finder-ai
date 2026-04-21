from functools import lru_cache
import os

# Try to use pydantic_settings (recommended), fall back to pydantic if available,
# and finally provide a lightweight, dotenv-aware fallback so the module never fails
# to import even if the optional package isn't installed in the environment.
try:
    from pydantic_settings import BaseSettings  # type: ignore
except Exception:
    try:
        # Some installations may expose BaseSettings via pydantic
        from pydantic import BaseSettings  # type: ignore
    except Exception:
        # Minimal fallback when neither package is available. This reads values
        # directly from the environment (and attempts to load a .env file if
        # python-dotenv is present). It intentionally mirrors only the behavior
        # needed by the app (defaults + env loading) so importing doesn't fail.
        try:
            from dotenv import load_dotenv
            load_dotenv()
        except Exception:
            # dotenv is optional; ignore if not present
            pass

        class Settings:
            # App
            APP_NAME: str = os.getenv("APP_NAME", "Place Finder AI")
            DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

            # Store as plain string — avoids JSON parsing issues
            ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")

            # Database
            DATABASE_URL: str = os.getenv("DATABASE_URL", "")

            # Security
            SECRET_KEY: str = os.getenv("SECRET_KEY", "")
            ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
            ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

            # External APIs
            GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
            OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")

            # Convert comma-separated string → list when accessed
            @property
            def allowed_origins_list(self) -> list[str]:
                return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

        @lru_cache()
        def get_settings() -> Settings:
            return Settings()

        settings = get_settings()
    else:
        # pydantic's BaseSettings is available
        class Settings(BaseSettings):
            # App
            APP_NAME: str = "Place Finder AI"
            DEBUG: bool = True

            # Store as plain string — avoids pydantic_settings JSON parsing issue
            ALLOWED_ORIGINS: str = "http://localhost:3000"

            # Database
            DATABASE_URL: str

            # Security
            SECRET_KEY: str
            ALGORITHM: str = "HS256"
            ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

            # External APIs
            GEMINI_API_KEY: str
            OPENWEATHER_API_KEY: str

            class Config:
                env_file = ".env"
                env_file_encoding = "utf-8"
                extra = "ignore"

            # Convert comma-separated string → list when accessed
            @property
            def allowed_origins_list(self) -> list[str]:
                return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

        @lru_cache()
        def get_settings() -> Settings:
            return Settings()

        settings = get_settings()
else:
    # pydantic_settings.BaseSettings imported successfully
    class Settings(BaseSettings):
        # App
        APP_NAME: str = "Place Finder AI"
        DEBUG: bool = True

        # Store as plain string — avoids pydantic_settings JSON parsing issue
        ALLOWED_ORIGINS: str = "http://localhost:3000"

        # Database
        DATABASE_URL: str

        # Security
        SECRET_KEY: str
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

        # External APIs
        GEMINI_API_KEY: str
        OPENWEATHER_API_KEY: str

        class Config:
            env_file = ".env"
            env_file_encoding = "utf-8"
            extra = "ignore"

        # Convert comma-separated string → list when accessed
        @property
        def allowed_origins_list(self) -> list[str]:
            return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    @lru_cache()
    def get_settings() -> Settings:
        return Settings()

    settings = get_settings()