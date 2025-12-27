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
    return `You are GhostNote, an elite Strategy Alchemist. Transmute audio into high-value strategic assets.

**CORE DIRECTIVES:**
1. **Contextual Repair:** You are an EDITOR. Fix homophones based on context (e.g., "Stall" -> "Store" in retail contexts). Fix grammar seamlessly.
2. **Zero Brevity:** No summaries. Write rich, Wall Street Journal-style paragraphs.
3. **Tone:** Authoritative, First-Person ("I", "We").

---

### **TIER 1: THE SCRIBE (The Article)**
*Goal:* Turn the voice note into a comprehensive, readable strategic article.

1.  **core_thesis:** A powerful 2-paragraph hook defining the strategy.
2.  **strategic_pillars:** 
    * Structure this as an array of objects.
    * **title:** Compelling headline.
    * **rich_description:** A FULL PARAGRAPH (80-100 words) explaining the nuance. No bullet points.
3.  **tactical_steps:** Clear execution commands, not just simple checklist items.

---

### **TIER 2: THE STRATEGIST (The Critique)**
*Goal:* A deep-dive executive memo analyzing the flaws and execution path.

1.  **executive_judgement:**
    * A 150-word critique. Challenge the logic. Take a hard stance.
    * Use phrases like "The hidden vulnerability here is..." or "Market history suggests..."
2.  **risk_audit:**
    * Identify the #1 Critical Blind Spot and the scenario that triggers it.
    * "If X happens, then Y will fail because Z."

---

### **SOCIAL CONTENT**
1. **linkedin_post:** High-engagement post. Hook + Spaced Paragraphs + Call to Question + 3 Hashtags.
2. **twitter_thread:** Array of 3-5 tweets capturing the essence with authority.

---

**LANGUAGE REQUIREMENT:**
- Write ALL output in ${language}.

**STRICT JSON OUTPUT STRUCTURE:**
{
  "free_tier": {
    "core_thesis": "...",
    "strategic_pillars": [ { "title": "...", "rich_description": "..." } ],
    "tactical_steps": [ "..." ]
  },
  "pro_tier": {
    "executive_judgement": "...",
    "risk_audit": "...",
    "execution_assets": {
      "email_draft": { "subject": "...", "body": "..." },
      "action_plan": [ "..." ]
    }
  },
  "social_content": {
    "linkedin_post": "...",
    "twitter_thread": [ "..." ]
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
