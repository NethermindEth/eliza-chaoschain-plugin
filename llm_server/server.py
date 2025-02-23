from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# OpenAI API Key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Request model
class PromptRequest(BaseModel):
    prompt: str

@app.post("/api/generate")
async def generate_text(request: PromptRequest):
    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": request.prompt}],
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the server using: uvicorn server:app --host 0.0.0.0 --port 1234
