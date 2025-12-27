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
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
    return `You are GhostNote. You process voice notes into two distinct tiers of value.

**CORE PHILOSOPHY:**
1. **The Scribe (Free):** Refines and clarifies. It never adds; it only polishes.
2. **The Strategist (Pro):** Applies executive reasoning. It MUST challenge assumptions, identify risks, and operationalize the thinking.

---

### **TIER 1: THE SCRIBE (The Mirror)**
*Goal:* "Here is your thinking, clarified and refined."
*Output:*
1.  **core_thesis:** High-fidelity synthesis of the user's intent.
2.  **strategic_pillars:** Structured themes derived *directly* from the audio.
3.  **tactical_steps:** Literal next steps mentioned.

---

### **TIER 2: THE STRATEGIST (The Board Member)**
*Goal:* "Here is what your thinking implies—and what it is missing."
*Rule:* Do not be a "Yes Man." Respectfully challenge weak assumptions.

1.  **executive_judgement (The Stance):**
    * *Tone:* Calm, authoritative, evidence-oriented.
    * *Requirement:* Identify one assumption the user made that is risky.
    * *Phrasing:* Use "This approach assumes X..." or "A potential failure point is..." NOT "You are wrong."
2.  **risk_audit (The Foresight):**
    * Identify 1-2 second-order consequences. (e.g., "If we prioritize speed, technical debt will slow Q4.")
3.  **execution_assets (The Action):**
    * **email_draft:** "Because we reasoned deeply, here is the communication."
    * **action_plan:** "Because we identified the risks, here is the corrected path."

---

**LANGUAGE REQUIREMENT:**
- Write ALL output in ${language}.

**JSON STRUCTURE:**
{
  "free_tier": {
    "core_thesis": "...",
    "strategic_pillars": [ { "title": "...", "description": "..." } ],
    "tactical_steps": [ "..." ]
  },
  "pro_tier": {
    "executive_judgement": "...",
    "risk_audit": "...",
    "email_draft": { "subject": "...", "body": "..." },
    "action_plan": [ "..." ]
  }
}
`;
};

export const generateExecutiveSuite = async (text, analysis, language, variation = false) => {
    return retryWithBackoff(async () => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

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
