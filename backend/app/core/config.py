import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "GhostNote Pro"
    PROJECT_VERSION: str = "1.0.0"
    
    # Strictly use GEMINI_API_KEY
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")

settings = Settings()

# Centralized AI Configuration
if not settings.GEMINI_API_KEY:
    print("CRITICAL WARNING: No API Key found. App will crash on generation.")
else:
    genai.configure(api_key=settings.GEMINI_API_KEY)
