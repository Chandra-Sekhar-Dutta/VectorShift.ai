import google.generativeai as genai
from app.config import GOOGLE_API_KEY, GEMINI_CHAT_MODEL

class ChatService:
    """Service for handling chat interactions with Google Generative AI"""
    
    @staticmethod
    def process_chat(system_prompt: str, user_message: str, temperature: float = 0.7, model: str = None, max_tokens: int = 2048) -> dict:
        """
        Process chat request using Google Generative AI (Gemini).
        
        Parameters:
        - system_prompt: System context/instructions for the chat
        - user_message: User's message
        - temperature: Creativity level 0-1 (default: 0.7)
        - model: Model name (default: gemini-pro)
        - max_tokens: Maximum tokens to generate (default: 2048)
        
        Returns:
        - dict: {'status': 'success'|'error', 'response': text, ...}
        """
        try:
            if not GOOGLE_API_KEY:
                return {
                    'status': 'error',
                    'message': 'Google API Key not configured. Please add GOOGLE_API_KEY to .env file',
                    'response': None
                }
            
            if not user_message:
                return {
                    'status': 'error',
                    'message': 'User message cannot be empty',
                    'response': None
                }
            
            # Initialize the model
            genai.configure(api_key=GOOGLE_API_KEY)
            model_name = model or GEMINI_CHAT_MODEL
            model_obj = genai.GenerativeModel(model_name=model_name, system_instruction=system_prompt)
            
            # Configure generation parameters
            generation_config = genai.types.GenerationConfig(
                temperature=max(0, min(1, temperature)),  # Clamp between 0-1
                max_output_tokens=max_tokens,
            )
            
            # Generate response
            response = model_obj.generate_content(
                user_message,
                generation_config=generation_config,
            )
            
            return {
                'status': 'success',
                'response': response.text if response else 'No response generated',
                'model': model_name,
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Chat Error: {str(e)}',
                'response': None
            }
