"""
Audio transcription using Gemini API.
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def transcribe_audio(file_path: str, language: str = None) -> str:
    """
    Transcribes audio file using Gemini.
    """
    try:
        # Upload the audio file
        audio_file = genai.upload_file(file_path)
        
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = "Transcribe this audio accurately. Return ONLY the transcription text, nothing else."
        if language:
            prompt = f"Transcribe this audio in {language}. Return ONLY the transcription text, nothing else."
        
        response = model.generate_content([prompt, audio_file])
        
        # Clean up the uploaded file
        genai.delete_file(audio_file.name)
        
        return response.text.strip()
        
    except Exception as e:
        print(f"Transcription error: {e}")
        raise e
