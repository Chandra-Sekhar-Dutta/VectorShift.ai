import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configuration
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:8000')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GEMINI_LLM_MODEL = os.getenv('GEMINI_LLM_MODEL', 'gemini-3-flash-preview')
GEMINI_CHAT_MODEL = os.getenv('GEMINI_CHAT_MODEL', 'gemini-pro')

# Configure Google Generative AI
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
