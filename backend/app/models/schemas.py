from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class Edge(BaseModel):
    source: str
    target: str

class PipelineData(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Edge]

class LLMRequest(BaseModel):
    system_prompt: str = "You are a helpful AI assistant."
    user_prompt: str = ""
    model: Optional[str] = None  # Uses GEMINI_LLM_MODEL from env if not specified
    temperature: float = 0.7
    max_tokens: int = 1024

class ChatRequest(BaseModel):
    system_prompt: str = "You are a helpful chatbot assistant."
    user_message: str = ""
    model: Optional[str] = None  # Uses GEMINI_CHAT_MODEL from env if not specified
    temperature: float = 0.7
    max_tokens: int = 2048

