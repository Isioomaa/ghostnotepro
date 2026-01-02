export const analyzeText = (text) => {
    if (!text || typeof text !== 'string') {
        return {
            word_count: 0,
            tone: "Neutral",
            emotion: "calm",
            virality_score: 0,
            suggestions: []
        };
    }
    const textLower = text.toLowerCase();
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Indicators of anger/frustration
    const angryIndicators = [
        "stop", "enough", "tired of", "sick of", "frustrated", "annoying",
        "wrong", "problem", "issue", "terrible", "awful", "hate", "never",
        "always", "stupid", "ridiculous", "unacceptable", "can't believe"
    ];

    // Indicators of excitement/enthusiasm
    const excitedIndicators = [
        "amazing", "incredible", "fantastic", "can't wait", "love",
        "excited", "opportunity", "future", "imagine", "vision",
        "breakthrough", "revolutionary", "game-changing", "transform"
    ];

    // Count indicators
    const angryCount = angryIndicators.reduce((count, indicator) =>
        textLower.includes(indicator) ? count + 1 : count, 0);

    const excitedCount = excitedIndicators.reduce((count, indicator) =>
        textLower.includes(indicator) ? count + 1 : count, 0);

    // Sentence length heuristic
    const sentences = text.split(/[.!?]+/);
    const avgSentenceLength = wordCount / Math.max(sentences.length, 1);

    let emotion = "calm";
    if (angryCount >= 2 || (angryCount >= 1 && avgSentenceLength < 10)) {
        emotion = "angry";
    } else if (excitedCount >= 2 || (excitedCount >= 1 && avgSentenceLength < 12)) {
        emotion = "excited";
    }

    const toneMap = {
        "angry": "Direct",
        "excited": "Visionary",
        "calm": "Reflective"
    };

    return {
        word_count: wordCount,
        tone: toneMap[emotion] || "Neutral",
        emotion: emotion,
        virality_score: Math.min(100, wordCount + 50), // Simple heuristic
        suggestions: []
    };
};
