# app/notifications.py
import httpx
from google.oauth2 import service_account
import google.auth.transport.requests
from app.config import settings

FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging"

def _access_token() -> str:
    creds = service_account.Credentials.from_service_account_file(
        settings.fcm_credentials_path, scopes=[FCM_SCOPE]
    )
    creds.refresh(google.auth.transport.requests.Request())
    return creds.token

async def send_push_notification(fcm_token: str, title: str, body: str, data: dict | None = None):
    url = f"https://fcm.googleapis.com/v1/projects/{settings.fcm_project_id}/messages:send"
    payload = {"message": {"token": fcm_token, "notification": {"title": title, "body": body},
                            "data": {k: str(v) for k, v in (data or {}).items()}}}
    headers = {"Authorization": f"Bearer {_access_token()}", "Content-Type": "application/json"}
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()