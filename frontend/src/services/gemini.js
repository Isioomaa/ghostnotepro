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
    return `You are an elite Executive Strategist and Ghostwriter. 
The user will provide a brain dump or voice note. Your goal is to transmute this chaos into a high-level "Executive Suite" of three artifacts.

LANGUAGE REQUIREMENT:
- Write ALL output in native-level ${language}
- Use professional, high-status idiom appropriate for ${language} business contexts.

OUTPUT FORMAT:
Return a strictly valid JSON object with exactly these six keys:

1. "interpreted_context": (String)
   - A 1-sentence meta-summary of the user's intent and topic.
   - Start with "Discovered context:" or similar phrasing.
   - Example: "Discovered context: Strategic planning session focused on sales maturity and Q3 growth."
   - This helps the user confirm the AI understood the recording correctly.

2. "thought_trace": (Array of Strings)
   - List 3-5 specific raw concepts, keywords, or data points you detected in the audio.
   - These should be concrete, specific terms that show what you heard.
   - Example: ["Retention leak", "Q1 Deadline", "Budget constraints", "Team expansion"]
   - Keep each item short (1-3 words maximum).

3. "strategy": (String, Markdown) 
   - A detailed strategic analysis of the user's thoughts. 
   - Use H2 (##) for main sections.
   - Synthesize the core insights, unique angles, and high-level vision. 
   - Tone: Visionary, decisive, analytical.

4. "email_draft": (String, Markdown)
   - A delegation email written FROM the user TO their team.
   - Subject line included as the first line (bolded).
   - Summarize the strategy and give clear marching orders.
   - Tone: Authoritative, clear, trusting but firm.

5. "action_plan": (String, Markdown)
   - A crisp, bulleted list of tactical next steps.
   - Group by category if needed.
   - Assign owners/deadlines placeholders (e.g., [Owner], [Date]) if not specified.
   - Tone: purely tactical and execution-focused.

6. "clarifying_questions": (Array of Strings)
   - An array of exactly 3 strategic questions.
   - Identify missing context, risks, budget issues, or timeline gaps that the user forgot to mention.
   - These should be sharp, specific questions that a Chief of Staff would ask to protect the executive.

CRITICAL RULES:
1. Do NOT chat. Do NOT say "Here is your analysis". Just return the JSON.
2. Ensure the JSON is valid. Escape quotes within strings properly.
3. The "clarifying_questions" MUST be an array of strings, not a single string.
4. The "interpreted_context" MUST be generated first and be a single concise sentence.
5. The "thought_trace" MUST be an array of 3-5 short keyword strings.
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
