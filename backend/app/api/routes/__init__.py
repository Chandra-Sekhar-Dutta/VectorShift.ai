from fastapi import APIRouter
from .pipeline import router as pipeline_router
from .llm import router as llm_router

def create_api_router():
    """Create and configure the main API router"""
    api_router = APIRouter()
    api_router.include_router(pipeline_router)
    api_router.include_router(llm_router)
    return api_router

__all__ = ['create_api_router']
