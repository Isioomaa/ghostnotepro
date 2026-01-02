from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

@app.get("/api/ping")
def ping():
    return {"status": "pong", "message": "Server is online (Root Anchored)"}

@app.post("/api/transmute")
async def transmute(file: UploadFile = File(...)):
    return {"status": "success", "message": "Draft Received"}

# Catch-all for routing variations
@app.post("/transmute")
async def transmute_alias(file: UploadFile = File(...)):
    return {"status": "success", "message": "Draft Received"}
