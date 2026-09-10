from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str
    secret_key: str
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    environment: str = "development"
    fcm_credentials_path: str = ""
    cors_origins: str = "*"
    service_token: str
    service_key: str

    class Config:
        env_file = ".env"

    @property
    def async_database_url(self) -> str:
        url = self.database_url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

settings = Settings()