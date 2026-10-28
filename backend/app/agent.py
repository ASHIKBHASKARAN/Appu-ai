import os
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are a practical personal AI assistant.
Help users reason through options, explain trade-offs, answer general questions, and plan tasks.
Be honest about uncertainty. Do not claim a tool ran unless it did.
Never request passwords or secrets."""

def classify_tool(message):
    text = message.lower()

    if any(x in text for x in ["remove background", "background remover", "transparent background"]):
        return "background_removal"

    if any(x in text for x in ["collage", "combine these photos", "combine images"]):
        return "image_collage"

    if any(x in text for x in ["help me decide", "compare", "which is better", "decision", "should i choose"]):
        return "decision_support"

    if any(x in text for x in ["plan my day", "task plan", "plan this project"]):
        return "task_planning"

    return "general_chat"


def generate_reply(message, memories=None):
    key = os.getenv("GEMINI_API_KEY", "").strip()

    if not key:
        return "Gemini API key is missing. Add GEMINI_API_KEY to backend/.env."

    try:
        from google import genai

        client = genai.Client(api_key=key)

        context = ""
        if memories:
            context = (
                "\nUser-approved memories (use only when relevant):\n"
                + "\n".join("- " + m["content"] for m in memories[:10])
            )

        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=(
                SYSTEM_PROMPT
                + context
                + "\n\nUser message:\n"
                + message
            ),
        )

        answer = response.text
        if answer:
            return answer

        return "I couldn't create a reply. Please try again."

    except Exception as exc:
        print("Gemini AI provider error:", exc)
        return (
            "I couldn't reach Gemini. Check your API key, model availability, "
            "free-tier limits, and internet connection."
        )