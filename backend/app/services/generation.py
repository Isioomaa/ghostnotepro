import google.generativeai as genai
import json
import os
from app.core.config import settings

# Configure Gemini
# Centrally configured in app.core.config

def clean_and_parse_json(text: str):
    """
    Robustly extracts and parses JSON from AI responses, 
    stripping markdown and conversational fluff.
    """
    try:
        # Remove literal markdown blocks if present
        clean_text = text.replace("```json", "").replace("```", "").strip()
        
        # Find the actual JSON object boundaries
        start = clean_text.find("{")
        end = clean_text.rfind("}")
        
        if start != -1 and end != -1:
            clean_text = clean_text[start:end+1]
        
        return json.loads(clean_text)
    except Exception as e:
        print(f"CRITICAL: JSON Parsing Failed. Raw response:\n{text}")
        raise ValueError(f"AI response was not valid JSON: {str(e)}")

def build_system_prompt(language: str) -> str:
    return f"""You are GhostNote, an elite Strategy Alchemist with "Alien Efficiency" capabilities. Transmute audio into high-value strategic assets.

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
3.  **emphasis_audit:**
    * "SYSTEM INSTRUCTION: EMPHASIS AUDIT"
    * Analyze the transcript for Time Weighting.
    * Identify the 'Stated Goal' (what the user said they wanted to talk about).
    * Measure the 'Actual Obsession' (what topic they spent the most time verbally processing).
    * If the Actual Obsession differs from the Stated Goal, flag it.

---

### **TIER 3: ALIEN EFFICIENCY (The Subtraction Engine)**
*Goal:* Identify what to STOP doing. Efficiency through elimination.

1.  **the_guillotine:** (The Subtraction Engine)
    * Identify energy drains, zombie projects, or sunk costs from the transcript.
    * Array of objects with:
        * **target:** What should be eliminated or paused.
        * **reason:** Why this is draining resources/energy.
        * **verdict:** 'TERMINATE' (kill it completely) or 'PAUSE' (revisit later).

2.  **pre_mortem_risks:** (Risk Simulation)
    * Assume any new plan mentioned WILL fail. Identify 3 specific reasons why based on context.
    * Array of objects with:
        * **risk:** What could go wrong.
        * **likelihood:** 'High' or 'Medium'.
        * **mitigation:** How to prevent this failure.

3.  **immediate_protocols:** (Action Assets)
    * Generate ready-to-copy drafts that the user can send immediately.
    * Array of objects with:
        * **title:** Brief name for this protocol.
        * **platform:** 'Email' or 'Slack'.
        * **content:** The full ready-to-send message draft.

---

### **SOCIAL CONTENT**
1. **linkedin_post:** High-engagement post. Hook + Spaced Paragraphs + Call to Question + 3 Hashtags.
2. **twitter_thread:** Array of 3-5 tweets capturing the essence with authority.

---

**LANGUAGE REQUIREMENT:**
- Write ALL output in {language}.

**STRICT JSON OUTPUT STRUCTURE:**
{{
  "free_tier": {{
    "core_thesis": "...",
    "strategic_pillars": [ {{ "title": "...", "rich_description": "..." }} ],
    "tactical_steps": [ "..." ]
  }},
  "pro_tier": {{
    "executive_judgement": "...",
    "risk_audit": "...",
    "emphasis_audit": {{
      "is_aligned": true,
      "stated_intent": "...",
      "actual_obsession": "...",
      "insight": "..."
    }},
    "the_guillotine": [
      {{ "target": "...", "reason": "...", "verdict": "TERMINATE" }}
    ],
    "pre_mortem_risks": [
      {{ "risk": "...", "likelihood": "High", "mitigation": "..." }}
    ],
    "immediate_protocols": [
      {{ "title": "...", "platform": "Email", "content": "..." }}
    ],
    "execution_assets": {{
      "email_draft": {{ "subject": "...", "body": "..." }},
      "action_plan": [ "..." ]
    }}
  }},
  "social_content": {{
    "linkedin_post": "...",
    "twitter_thread": [ "..." ]
  }}
}}
"""

async def generate_executive_suite(text: str, language: str = "English", variation: bool = False):
    try:
        print(f"DEBUG: [Generation] Starting generation with model: gemini-2.5-flash")
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        system_prompt = build_system_prompt(language)
        
        if variation:
            user_prompt = f"Here is the executive's raw thought stream. Transmute it into the Executive Suite. IMPORTANT: Create a DIFFERENT strategic angle this time. Focus on alternative risks or opportunities:\n\n{text}"
        else:
            user_prompt = f"Here is the executive's raw thought stream. Transmute it into the Executive Suite:\n\n{text}"
        
        print("DEBUG: [Generation] Calling Gemini API...")
        response = model.generate_content(
            [system_prompt, user_prompt],
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                response_mime_type="application/json",
            )
        )
        print("DEBUG: [Generation] Gemini API response received.")
        
        return clean_and_parse_json(response.text)
        
    except Exception as e:
        print(f"DEBUG: [Generation] Error: {str(e)}")
        raise e

async def audit_judgment(past_transcript: str, present_transcript: str):
    """
    The Variance Engine: Compares past predictions/context with present outcomes.
    """
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        prompt = f"""You are the GhostNote judgment Auditor. Evaluate the variance between a past strategic intent and the present outcome.

### PAST CONTEXT (The High-Level Thought):
{past_transcript}

### PRESENT OUTCOME (The Ground Reality):
{present_transcript}

---

### TASK:
1. Compare the two.
2. Calculate the 'Accuracy Score' (0-100) based on how well the past strategy/prediction matched reality.
3. Identify the #1 'Blind Spot' (Why they were wrong or what they missed).
4. Provide a 'Growth Insight' (How their judgment is evolving).

Respond in JSON format ONLY:
{{
  "accuracy_score": 85,
  "blind_spot": "Brief sentence describing the gap.",
  "growth_insight": "Brief sentence on judgment evolution."
}}
"""
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.5,
                response_mime_type="application/json",
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"DEBUG: [Audit] Error: {e}")
        return {
            "accuracy_score": 50,
            "blind_spot": "Error calculating variance.",
            "growth_insight": "Judgment data inconclusive."
        }
