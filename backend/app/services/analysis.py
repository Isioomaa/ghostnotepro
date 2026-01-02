"""
Emotion analysis service for audio content.
Analyzes vocal characteristics to determine emotional state.
"""

# Filler words to remove from transcripts
FILLER_WORDS = [
    "um", "uh", "like", "you know", "basically", "actually", "literally",
    "so", "well", "right", "okay", "I mean", "kind of", "sort of",
    "just", "really", "very", "honestly", "seriously", "obviously"
]


def remove_filler_words(text: str) -> str:
    """Remove common filler words from transcript."""
    result = text
    for filler in FILLER_WORDS:
        # Case-insensitive replacement
        import re
        pattern = re.compile(r'\b' + re.escape(filler) + r'\b', re.IGNORECASE)
        result = pattern.sub('', result)
    # Clean up extra spaces
    result = ' '.join(result.split())
    return result


def analyze_emotion_from_text(text: str) -> str:
    """
    Analyze emotional state from text characteristics.
    In production, this would analyze actual audio features (pitch, speed, volume).
    For now, we use text-based heuristics as a proxy.
    
    Returns: 'angry', 'excited', or 'calm'
    """
    text_lower = text.lower()
    word_count = len(text.split())
    
    # Indicators of anger/frustration
    angry_indicators = [
        "stop", "enough", "tired of", "sick of", "frustrated", "annoying",
        "wrong", "problem", "issue", "terrible", "awful", "hate", "never",
        "always", "stupid", "ridiculous", "unacceptable", "can't believe"
    ]
    
    # Indicators of excitement/enthusiasm
    excited_indicators = [
        "amazing", "incredible", "fantastic", "can't wait", "love", 
        "excited", "opportunity", "future", "imagine", "vision",
        "breakthrough", "revolutionary", "game-changing", "transform"
    ]
    
    # Count indicators
    angry_count = sum(1 for indicator in angry_indicators if indicator in text_lower)
    excited_count = sum(1 for indicator in excited_indicators if indicator in text_lower)
    
    # Short, punchy sentences suggest anger
    sentences = text.split('.')
    avg_sentence_length = word_count / max(len(sentences), 1)
    
    # Determine emotion
    if angry_count >= 2 or (angry_count >= 1 and avg_sentence_length < 10):
        return "angry"
    elif excited_count >= 2 or (excited_count >= 1 and avg_sentence_length < 12):
        return "excited"
    else:
        return "calm"


def analyze_text(text: str):
    """
    Analyzes text for virality and emotional characteristics.
    Returns a dict with analysis results.
    """
    word_count = len(text.split())
    emotion = analyze_emotion_from_text(text)
    
    # Map emotion to display tone
    tone_map = {
        "angry": "Direct",
        "excited": "Visionary", 
        "calm": "Reflective"
    }
    
    return {
        "word_count": word_count,
        "tone": tone_map.get(emotion, "Neutral"),
        "emotion": emotion,
        "virality_score": min(100, word_count + 50),
        "suggestions": []  # No more casual suggestions
    }
