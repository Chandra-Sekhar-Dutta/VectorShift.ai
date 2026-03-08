from fastapi import APIRouter
from app.models import ChatRequest
from app.services import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post('/process')
def process_chat(request: ChatRequest):
    """
    Process chat request using Google Generative AI (Gemini).
    
    Parameters:
    - system_prompt: System context/instructions for the chat
    - user_message: User's input message
    - model: Model name (default from GEMINI_CHAT_MODEL env var)
    - temperature: Creativity level 0-1 (default: 0.7)
    - max_tokens: Maximum tokens to generate (default: 2048)
    
    Returns:
    - response: Generated text from the chat model
    - status: Processing status ('success' or 'error')
    """
    return ChatService.process_chat(
        system_prompt=request.system_prompt,
        user_message=request.user_message,
        temperature=request.temperature,
        model=request.model,
        max_tokens=request.max_tokens
    )
