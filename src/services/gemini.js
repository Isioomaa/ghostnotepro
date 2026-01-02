import axios from 'axios';

const API_BASE_URL = '/api'; // Use relative path for Vercel/Production

/**
 * Robustly parses JSON from AI responses by stripping markdown and conversational text.
 */
const cleanAndParseJSON = (text) => {
    // If it's already an object, return it
    if (typeof text !== 'string') return text;

    try {
        // Remove markdown block backticks and 'json' identifier
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Extract content between the first and last curly braces
        const start = cleanText.indexOf('{');
        const end = cleanText.lastIndexOf('}');

        if (start !== -1 && end !== -1) {
            cleanText = cleanText.substring(start, end + 1);
        }

        return JSON.parse(cleanText);
    } catch (e) {
        console.error("STRICT JSON PARSING FAILED. RAW TEXT:", text);
        throw new Error("The strategy generation returned an invalid format. Results were logged to console.");
    }
};

export const transmuteAudio = async (audioBlob, language) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    if (language) formData.append('language', language);

    try {
        const response = await axios.post(`${API_BASE_URL}/transmute`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.text;
    } catch (error) {
        console.error("Transmutation error:", error);
        throw error;
    }
};

export const generateExecutiveSuite = async (text, analysis, language, variation = false) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/generate-post`, {
            text,
            analysis,
            language,
            variation
        });

        // Apply robust parsing in case the backend returns a string or has raw fluff
        const processedData = cleanAndParseJSON(response.data);
        return processedData; // Now returns { session_id, data }
    } catch (error) {
        console.error("Generation error:", error);
        throw error;
    }
};

export const saveDraft = async (audioBlob, language) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'draft.webm');
    if (language) formData.append('language', language);

    try {
        const response = await axios.post(`${API_BASE_URL}/save_draft`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Save draft error:", error);
        throw error;
    }
};
export const sealWager = async (sessionId, prediction, days) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/decisions/seal`, {
            session_id: sessionId,
            prediction,
            days
        });
        return response.data;
    } catch (error) {
        console.error("Seal wager error:", error);
        throw error;
    }
};

export const fetchDecisionHistory = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/decisions/history`);
        return response.data;
    } catch (error) {
        console.error("Fetch history error:", error);
        throw error;
    }
};

export const auditDecision = async (decisionId, audioBlob, language) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'update.webm');
    if (language) formData.append('language', language);

    try {
        const response = await axios.post(`${API_BASE_URL}/decisions/audit/${decisionId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Audit decision error:", error);
        throw error;
    }
};
