#!/usr/bin/env python3
"""
FastAPI application using GPT-2 model
Working version that fits in memory
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model_loader_gpt2 import SanatanaLLMGPT2
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Sanatana Dharma LLM API",
    description="AI-powered Bhagavad-Gita knowledge system",
    version="1.0.0"
)

# Global model instance
model = None

class ChatRequest(BaseModel):
    message: str
    mode: str = "scholar"  # "scholar" or "child"

class ChatResponse(BaseModel):
    response: str
    citations: list
    audio_url: str = ""
    mode: str
    confidence: float
    generation_time: float
    model_used: str

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    global model
    try:
        logger.info("Initializing GPT-2 model...")
        model = SanatanaLLMGPT2(model_path="models/checkpoint-93")
        logger.info("GPT-2 model initialized successfully!")
    except Exception as e:
        logger.error(f"Failed to initialize model: {e}")
        raise e

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Sanatana Dharma LLM API is running",
        "model": "GPT-2",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_type": "GPT-2",
        "version": "1.0.0"
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint for asking questions about Bhagavad-Gita"""
    try:
        if model is None:
            raise HTTPException(status_code=503, detail="Model not loaded")
        
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Validate mode
        if request.mode not in ["scholar", "child"]:
            request.mode = "scholar"
        
        logger.info(f"Processing request: {request.message[:50]}...")
        
        # Generate response
        response = model.generate_response(
            prompt=request.message,
            mode=request.mode,
            max_length=512,
            temperature=0.8
        )
        
        logger.info(f"Generated response in {response['generation_time']:.2f}s")
        
        return ChatResponse(**response)
        
    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/examples")
async def get_examples():
    """Get example questions for testing"""
    return {
        "scholar_examples": [
            "What is karma yoga according to the Bhagavad-Gita?",
            "Explain the concept of dharma in Chapter 2",
            "What does Krishna teach about detachment?",
            "How does the Gita define the three gunas?",
            "What is the significance of the battlefield setting?"
        ],
        "child_examples": [
            "What is dharma?",
            "How should I behave according to the Gita?",
            "What does Krishna teach about being good?",
            "How can I be brave like Arjuna?",
            "What is the meaning of karma?"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

