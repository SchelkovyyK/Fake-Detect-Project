from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os

from factchecker import fact_check_news

# ------------------------
# CREATE APP FIRST
# ------------------------
app = FastAPI()

# ------------------------
# CORS
# ------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# FRONTEND PATH
# ------------------------
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")

# /static → frontend folder
app.mount("/static", StaticFiles(directory=frontend_path), name="static")

# Serve index.html on "/"
@app.get("/")
def serve_frontend():
    return FileResponse(os.path.join(frontend_path, "fakedetect.html"))

# ------------------------
# API ENDPOINT
# ------------------------
class TextRequest(BaseModel):
    text: str | None = None
    url: str | None = None

@app.post("/factcheck")
def factcheck(req: TextRequest):
    if req.text:
        return fact_check_news(req.text)

    if req.url:
        return {"error": "URL fetching not implemented yet"}

    return {"error": "No text or URL provided"}
