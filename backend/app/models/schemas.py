from pydantic import BaseModel
from typing import List, Dict, Any

class Edge(BaseModel):
    source: str
    target: str

class PipelineData(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Edge]

class LLMRequest(BaseModel):
    system_prompt: str
    user_prompt: str
    model: str = "gemini-3-flash-preview"
    temperature: float = 0.7
    max_tokens: int = 1024
