"""
Post generation service powered by Gemini AI.
Generates platform-optimized posts in the selected language.
"""
import os
import google.generativeai as genai
from app.services.analysis import remove_filler_words
from typing import List

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY"))


def build_system_prompt(platforms: List[str], emotion: str, language: str) -> str:
    """
    Build a system prompt for the selected platforms, emotion, and language.
    """
    platform_instructions = []
    
    if "twitter" in platforms:
        platform_instructions.append("For X/Twitter: Keep under 280 characters. Punchy and direct.")
    if "linkedin" in platforms:
        platform_instructions.append("For LinkedIn: Use paragraph spacing. Professional tone. Can be longer.")
    if "instagram" in platforms:
        platform_instructions.append("For Instagram: Visual-first caption style. Under 2200 characters.")
    if "tiktok" in platforms:
        platform_instructions.append("For TikTok: Brief, engaging, conversational. Under 300 characters.")
    
    emotion_style = {
        "angry": "Write in a 'Hot Take' style. Short, punchy sentences. Aggressive hook (e.g., 'Stop doing this immediately.').",
        "excited": "Write in a 'Visionary' style. Inspiring language, future-tense, high energy.",
        "calm": "Write in a 'Reflective' style. Storytelling, longer paragraphs, philosophical tone."
    }
    
    style = emotion_style.get(emotion, emotion_style["calm"])
    platforms_str = ", ".join(platforms) if platforms else "general social media"
    
    return f"""You are an elite Ghostwriter. The user wants a high-status LinkedIn post written in {language}.

LANGUAGE REQUIREMENT:
- Write the ENTIRE post in native-level, culturally accurate {language}
- Use idioms and expressions natural to {language} speakers
- Do NOT write in English unless the selected language is English

WRITING STYLE:
- Write like a confident, high-status executive
- Never use emojis
- Never use exclamation marks
- Never use hashtags
- Remove all filler words
- Always end with a thought-provoking question

EMOTIONAL STYLE (based on audio tone):
{style}

TARGET PLATFORMS: {platforms_str}
{chr(10).join(platform_instructions)}

CRITICAL RULES:
1. Do NOT explain the emotion or your process
2. Do NOT say things like "Here is your post" or "Based on the tone..."
3. Just output the final post text in {language}, nothing else
4. Create ONE unified post that works across all selected platforms
"""


async def generate_social_posts(analyzed_data: dict, text: str, platforms: List[str] = None, language: str = "English", variation: bool = False):
    """
    Generate posts using Gemini AI in the selected language.
    If variation=True, request a different creative take.
    """
    if platforms is None:
        platforms = ["twitter", "linkedin"]
    
    emotion = analyzed_data.get("emotion", "calm")
    clean_text = remove_filler_words(text)
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        system_prompt = build_system_prompt(platforms, emotion, language)
        
        if variation:
            user_prompt = f"Transform this voice transcript into a viral post in {language}. IMPORTANT: Create a COMPLETELY DIFFERENT creative variation - use a different angle, tone, or structure than before:\n\n{clean_text}"
        else:
            user_prompt = f"Transform this voice transcript into a viral post in {language}:\n\n{clean_text}"
        
        response = model.generate_content(
            [system_prompt, user_prompt],
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=1000,
            )
        )
        
        generated_text = response.text.strip()
        
    except Exception as e:
        print(f"Gemini error: {e}")
        generated_text = generate_fallback_post(clean_text, emotion)
    
    return {
        "twitter": {
            "content": generated_text[:280] if len(generated_text) > 280 else generated_text,
            "char_count": min(len(generated_text), 280)
        },
        "linkedin": {
            "content": generated_text,
            "char_count": len(generated_text)
        },
        "instagram": {
            "content": generated_text,
            "char_count": len(generated_text)
        },
        "tiktok": {
            "content": generated_text[:300] if len(generated_text) > 300 else generated_text,
            "char_count": min(len(generated_text), 300)
        }
    }


def generate_fallback_post(text: str, emotion: str) -> str:
    """
    Fallback template-based generation if Gemini is unavailable.
    """
    text = text.replace('!', '.').strip()
    
    if emotion == "angry":
        return f"Stop.\n\n{text[:200]}.\n\nWhat are you going to do about it?"
    elif emotion == "excited":
        return f"The future is clear.\n\n{text[:200]}.\n\nAre you ready for what comes next?"
    else:
        return f"I have been thinking about this.\n\n{text[:200]}.\n\nWhat has your experience been?"
