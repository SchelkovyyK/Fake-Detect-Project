import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def fact_check_news(article_text: str) -> dict:
    system_prompt = (
        "You are an expert fact-checker.\n"
        "1. Extract factual claims.\n"
        "2. Use web search tools to validate.\n"
        "3. Return JSON ONLY:\n"
        "{\n"
        "  'classification': 'REAL' or 'FAKE',\n"
        "  'reasoning': 'text',\n"
        "  'evidence': [{ 'claim': 'text', 'urls': ['url1','url2'] }]\n"
        "}\n"
    )

    user_prompt = f"Article:\n{article_text}\n\nFact-check this."

    response = client.chat.completions.create(
        model="llama3-groq-70b-tool-use-preview",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        tools={"enabled_tools": ["web_search", "visit_website"]},
        temperature=0.2
    )

    content = response.choices[0].message.content

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "classification": "UNKNOWN",
            "reasoning": content,
            "evidence": []
        }
