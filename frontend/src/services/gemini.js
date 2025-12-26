import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0 || (!error.message?.includes('503') && !error.toString().includes('503'))) {
            throw error;
        }
        console.warn(`Gemini API 503 error. Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
    }
};

const fileToGenerativePart = async (blob) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            resolve({
                inlineData: {
                    data: base64data,
                    mimeType: "audio/webm",
                },
            });
        };
        reader.readAsDataURL(blob);
    });
};

export const transcribeAudio = async (audioBlob, language) => {
    return retryWithBackoff(async () => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const audioPart = await fileToGenerativePart(audioBlob);

            let prompt = "Transcribe this audio accurately. Return ONLY the transcription text, nothing else.";
            if (language) {
                prompt = `Transcribe this audio in ${language}. Return ONLY the transcription text, nothing else.`;
            }

            const result = await model.generateContent([prompt, audioPart]);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error("Transcription error:", error);
            throw error; // Re-throw for retry handler
        }
    });
};

const buildSystemPrompt = (language) => {
    return `ROLE:
You are GhostnotePro, an executive-grade thinking system.
You do not transcribe speech.
You resolve intent and transform spoken thought into clear, structured, strategic writing.
Your job is to make the user’s thinking sharper, clearer, and more influential than it was when spoken.

LANGUAGE REQUIREMENT:
- Write ALL output in native-level ${language}
- Use professional, high-status idiom appropriate for ${language} business contexts.

INPUT ASSUMPTIONS:
- Input text comes from spoken thoughts
- It may be messy, repetitive, or exploratory
- The user expects intelligence, not a transcript
- Do not ask clarifying questions

CORE RULES (STRICT):
1. Never mirror speech or filler words
2. Abstract upward — capture meaning, not phrasing
3. Always impose structure
4. Improve clarity, confidence, and direction
5. If the output feels like something the user could have typed themselves, you have failed.

TONE:
Calm, Intelligent, Decisive, Executive-grade, No fluff, No emojis.

OUTPUT FORMAT:
Return a strictly valid JSON object with these keys:

1. "interpreted_context": (String) A 1-sentence meta-summary (Discovered context: ...).
2. "thought_trace": (Array of Strings) 3-5 keywords detected in the audio.
3. "confidence_analysis": (Object) { level: "High"|"Medium"|"Low", reason: String, clarification_question: String }
4. "executive_summary": (String) A concise synthesis of the user’s full intent in confident, executive language.
5. "key_points": (Array of Strings) 3–6 bullets capturing the most important ideas.
6. "strategic_interpretation": (String) A higher-level reframing that adds insight, implication, or direction beyond what was explicitly said.
7. "action_direction": (String) Clear next steps, decisions, or positioning derived from the thinking.
8. "x_version": (String) Max 280 characters, sharp, insight-driven, no hashtags/emojis.
9. "linkedin_version": (String) Professional, reflective, short paragraphs, no formatting/hashtags.
10. "whatsapp_version": (String) Clear, conversational, direct and human.

PHILOSOPHY:
The user should feel: “This captures exactly what I meant — only clearer and more powerful.”
`;
};

export const generateExecutiveSuite = async (text, analysis, language, variation = false) => {
    return retryWithBackoff(async () => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

            const systemPrompt = buildSystemPrompt(language);

            let userPrompt = `Here is the executive's raw thought stream. Transmute it into the Executive Suite:\n\n${text}`;
            if (variation) {
                userPrompt = `Here is the executive's raw thought stream. Transmute it into the Executive Suite. IMPORTANT: Create a DIFFERENT strategic angle this time. Focus on alternative risks or opportunities:\n\n${text}`;
            }

            const result = await model.generateContent([systemPrompt, userPrompt]);
            const response = await result.response;
            const textResponse = response.text();

            // Parse JSON response
            let jsonResponse;
            try {
                jsonResponse = JSON.parse(textResponse);
            } catch (e) {
                console.error("JSON Parse Error", e);
                throw new Error("Failed to parse AI response");
            }

            return jsonResponse;
        } catch (error) {
            console.error("Generation error:", error);
            throw error; // Re-throw for retry handler
        }
    });
};
