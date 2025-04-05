from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import google.generativeai as genai
import logging
import json
from datetime import datetime
from functools import wraps
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='api.log'
)
logger = logging.getLogger(__name__)

def log_request(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        start_time = datetime.now()
        response = func(request, *args, **kwargs)
        end_time = datetime.now()
        
        logger.info(
            f"Endpoint: {request.path} | "
            f"Method: {request.method} | "
            f"Duration: {(end_time - start_time).total_seconds()}s | "
            f"Status: {response.status_code}"
        )
        return response
    return wrapper

@csrf_exempt
@require_http_methods(["POST"])
@log_request
def generate_response(request):
    try:
        data = json.loads(request.body)
        prompt = data.get('prompt')
        
        if not prompt:
            return JsonResponse({"error": "No prompt provided"}, status=400)
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-pro')
        
        # Generate response
        response = model.generate_content(prompt)
        
        return JsonResponse({
            "response": response.text,
            "timestamp": datetime.now().isoformat()
        })
        
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
