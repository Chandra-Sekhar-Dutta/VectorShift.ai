import google.generativeai as genai
from app.config import GOOGLE_API_KEY
from app.models.schemas import LLMRequest

class LLMService:
    """Service for handling LLM operations with Google Generative AI"""
    
    @staticmethod
    def process(request: LLMRequest) -> dict:
        """
        Process LLM request using Google Generative AI (Gemini).
        
        Parameters:
        - request: LLMRequest containing system_prompt, user_prompt, model, temperature, max_tokens
        
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
            
            if not request.system_prompt and not request.user_prompt:
                return {
                    'status': 'error',
                    'message': 'Both system and user prompts cannot be empty',
                    'response': None
                }
            
            # Combine system and user prompts
            full_prompt = ""
            if request.system_prompt:
                full_prompt += f"<system>\n{request.system_prompt}\n</system>\n\n"
            if request.user_prompt:
                full_prompt += f"<user>\n{request.user_prompt}\n</user>"
            
            # Initialize the model
            model = genai.GenerativeModel(model_name=request.model)
            
            # Configure generation parameters
            generation_config = genai.types.GenerationConfig(
                temperature=max(0, min(1, request.temperature)),  # Clamp between 0-1
                max_output_tokens=request.max_tokens,
            )
            
            # Generate response
            response = model.generate_content(
                full_prompt,
                generation_config=generation_config,
            )
            
            return {
                'status': 'success',
                'response': response.text if response else 'No response generated',
                'model': request.model,
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'LLM Error: {str(e)}',
                'response': None
            }
