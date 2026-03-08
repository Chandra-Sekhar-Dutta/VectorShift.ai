from fastapi import APIRouter
from app.models import LLMRequest
from app.services import LLMService

router = APIRouter(prefix="/llm", tags=["llm"])

@router.post('/process')
def process_llm(request: LLMRequest):
    """
    Process LLM request using Google Generative AI (Gemini).
    
    Parameters:
    - system_prompt: System context/instructions for the LLM
    - user_prompt: User's input prompt
    - model: Model name (default: gemini-pro)
    - temperature: Creativity level 0-1 (default: 0.7)
    - max_tokens: Maximum tokens to generate (default: 1024)
    
    Returns:
    - response: Generated text from the LLM
    - status: Processing status ('success' or 'error')
    """
    return LLMService.process(request)
