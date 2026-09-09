from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.routes import auth, sessions, patients, recommendations, reminders, dashboard

app = FastAPI(title="SmritiCare API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid request data", "errors": exc.errors()},
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    import traceback
    print(f"Unhandled error on {request.url}: {traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
    )

app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(patients.router)
app.include_router(recommendations.router)
app.include_router(reminders.router)
app.include_router(dashboard.router)

@app.get("/health")
async def health():
    return {"status": "ok"}