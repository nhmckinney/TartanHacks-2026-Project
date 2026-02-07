# agent.py
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import anthropic
import json

# Initialize Anthropic client (ensure ANTHROPIC_API_KEY is in your env variables)
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

router = APIRouter()

SYSTEM_PROMPT = """
You are PayDrift, a sharp, no-nonsense CFO advisor. 
Your goal is to analyze spend drift (unplanned budget variance) and provide actionable, high-impact advice.

Your output must always be in valid Markdown.
When analyzing data, structure your response exactly like this:

### 🚨 Analysis: What Happened & Why
(A concise, executive summary of the drift. Identify the root cause categories like "AI/LLM Over-usage" or "Contractor Bloat".)

### ⚡ Strategic Recommendations
(Provide exactly 5-7 ranked actions. For each, use a bullet point and include:)
* **[Action Name]**: Specific instruction. (Est. Savings: $X, Effort: Low/Med/High, Timeline: X weeks)

Do not use introductory fluff ("Here is your analysis"). Jump straight into the insights.
"""

class ChatMessage(BaseModel):
    role: str
    content: str

class AnalyzeRequest(BaseModel):
    context: Optional[dict] = None

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]
    drift_data: dict  # Pass the current dashboard data so Claude has context

def format_drift_for_claude(data):
    """Converts the raw JSON drift data into a readable text summary for the LLM."""
    summary = f"Total Monthly Drift: ${data.get('total_monthly_drift', 0)}\n"
    summary += f"Annualized Impact: ${data.get('annualized_drift', 0)}\n\n"
    
    summary += "Category Breakdown:\n"
    for cat in data.get('categories', []):
        summary += f"- {cat['category'].upper()}: ${cat['total_drift']} drift ({cat['drift_pct']}%) \n"
        summary += "  Top Items:\n"
        for item in cat.get('items', [])[:3]: # Top 3 items per category
            summary += f"    * {item['item']}: ${item['drift']} drift (From ${item['avg_before']} to ${item['avg_after']})\n"
            
    return summary

@router.post("/analyze")
async def analyze_drift(data: dict): # Accepting the full data object from frontend for simplicity
    try:
        data_text = format_drift_for_claude(data)
        
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            temperature=0.1, # Low temp for analytical precision
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": f"Here is the current spend drift data:\n{data_text}\n\nAnalyze this and tell me what to do."}
            ]
        )
        return {"markdown": message.content[0].text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat_agent(req: ChatRequest):
    try:
        data_text = format_drift_for_claude(req.drift_data)
        
        # Inject context into the latest message or system prompt
        # We'll prepend context to the conversation for this turn
        context_message = f"CONTEXT [Current Drift Data]:\n{data_text}\n\nUSER QUESTION: {req.message}"
        
        messages = [{"role": m.role, "content": m.content} for m in req.history]
        messages.append({"role": "user", "content": context_message})

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=500,
            temperature=0.7,
            system=SYSTEM_PROMPT,
            messages=messages
        )
        return {"response": response.content[0].text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))