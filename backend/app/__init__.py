from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import FRONTEND_URL
from app.api.routes import create_api_router

def create_app():
    """Application factory function"""
    app = FastAPI(title="VectorShift Backend API")
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Root endpoint
    @app.get('/')
    def read_root():
        return {'Listening at': 'http://localhost:8000'}
    
    # Include API routes
    api_router = create_api_router()
    app.include_router(api_router)
    
    return app
