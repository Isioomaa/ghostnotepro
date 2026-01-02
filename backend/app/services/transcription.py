import google.generativeai as genai
import asyncio
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

async def transcribe_audio(file_path: str, language: str = None) -> str:
    """
    Transcribes audio file using Gemini.
    """
    try:
        print(f"DEBUG: [Transcription] Uploading file to Gemini: {file_path}")
        # Upload the audio file
        audio_file = genai.upload_file(file_path)
        print(f"DEBUG: [Transcription] File uploaded. Initial state: {audio_file.state.name}")
        
        # Wait for the file to be ready
        max_attempts = 60
        attempt = 0
        while audio_file.state.name == "PROCESSING" and attempt < max_attempts:
            print(f"DEBUG: [Transcription] File state: {audio_file.state.name}. Waiting... (Attempt {attempt+1})")
            await asyncio.sleep(1)
            audio_file = genai.get_file(audio_file.name)
            attempt += 1
            
        if audio_file.state.name == "FAILED":
            print(f"DEBUG: [Transcription] Critical: Gemini Audio Processing FAILED")
            raise Exception("Gemini audio processing failed. The file format or content might be unsupported.")

        if audio_file.state.name != "ACTIVE":
            print(f"DEBUG: [Transcription] Timeout: File stuck in {audio_file.state.name}")
            raise Exception("Gemini processing timeout.")

        print(f"DEBUG: [Transcription] Using gemini-2.5-flash...")
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = "Transcribe this audio accurately. Return ONLY the transcription text, nothing else."
        if language:
            prompt = f"Transcribe this audio in {language}. Return ONLY the transcription text, nothing else."
        
        print("DEBUG: [Transcription] Starting content generation (Sync)...")
        # Using sync version as it's often more stable in certain environments
        response = model.generate_content([prompt, audio_file])
        print("DEBUG: [Transcription] Generation complete.")
        
        try:
            genai.delete_file(audio_file.name)
        except Exception as e:
            print(f"DEBUG: [Transcription] Cleanup warning: {e}")
            
        return response.text.strip()
        
    except Exception as e:
        print(f"DEBUG: [Transcription] Error: {str(e)}")
        raise e
