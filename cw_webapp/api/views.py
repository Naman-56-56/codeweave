from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import logging
import json
from datetime import datetime
from functools import wraps
from dotenv import load_dotenv
import os
import requests
import time
import sys

# Create your views here.
def app(request):
    return render(request, 'app.html')

def devenv(request):
    phase_id = request.GET.get('phase', '1')  
    return render(request, 'devenv.html', {'phase_id': phase_id})

load_dotenv()

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
# genai.configure(api_key=GOOGLE_API_KEY)


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='api.log',
    force=True
)
# Add stream handler for terminal output
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger = logging.getLogger(__name__)
if not any(isinstance(h, logging.StreamHandler) for h in logger.handlers):
    logger.addHandler(console_handler)


roadmap_cache = {}

DJANGO_API_URL = "http://127.0.0.1:8000/projects/save_project/"


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

def validate_request(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            if not data or 'prompt' not in data:
                return JsonResponse({"error": "Missing 'prompt' field in request"}, status=400)
                
            if not isinstance(data['prompt'], str) or len(data['prompt'].strip()) == 0:
                return JsonResponse({"error": "Prompt must be a non-empty string"}, status=400)
                
            return func(request, *args, **kwargs)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    return wrapper

def validate_auth(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Token '):
            return JsonResponse({"error": "Missing or invalid authentication token"}, status=401)
            
        return func(request, *args, **kwargs)
    return wrapper

def get_prompt_template(prompt):
    return f"""You're an expert software architect and engineer.

Generate a detailed, tech-oriented development roadmap for: "{prompt}"

The roadmap must be returned in raw JSON format only — no markdown, no explanation, no comments.

### JSON FORMAT:
{{
  "project_overview": {{
    "name": "Project Name",
    "description": "What the project does",
    "tech_stack": {{
      "frontend": "Frontend framework (e.g., React, Flutter)",
      "backend": "Backend framework (e.g., Django, Node.js)",
      "database": "Database (e.g., PostgreSQL, MongoDB)",
      "libraries": ["Key libraries"],
      "tools": ["Dev tools, linters, CI/CD, etc."],
      "apis": ["External APIs or SDKs used"]
    }},
    "architecture": "High-level architecture (e.g., RESTful API + SPA frontend)",
    "estimated_duration": "Overall dev time estimate",
    "team_roles": ["Developer roles (e.g., Frontend Dev, DevOps)"]
  }},
  "phases": {{
    "phase1": {{
      "name": "Phase Name",
      "overview": "Summary of what this phase covers",
      "duration": "Time estimate",
      "objectives": ["Phase goal 1", "Phase goal 2"],
      "modules": [
        {{
          "name": "Module name (e.g., Auth System)",
          "description": "Short technical summary",
          "tasks": [
            "Code-level task 1",
            "Code-level task 2"
          ],
          "technologies": ["Libraries/APIs/tools used in this module"]
        }}
      ]
    }},
    "phase2": {{
      ...
    }}
  }}
}}

### INSTRUCTIONS:
1. Suggest real frameworks/tools based on the project type.
2. Ensure all JSON brackets are closed — no trailing commas.
3. Respond ONLY with raw JSON.
"""




def generate_roadmap(prompt):
    try:
        logger.info(f"Starting roadmap generation for prompt: {prompt}")
        cache_key = prompt.lower().strip()
        logger.debug(f"Cache key generated: {cache_key}")
        if cache_key in roadmap_cache:
            logger.info(f"Returning cached roadmap for prompt: {prompt}")
            return roadmap_cache[cache_key]

        # Ollama API call
        ollama_payload = {
            "model": "mistral",
            "prompt": get_prompt_template(prompt),
        }
        response = requests.post("http://localhost:11434/api/generate", json=ollama_payload)
        if response.status_code != 200:
            logger.error(f"Ollama request failed: {response.text}")
            return create_default_roadmap(prompt)

        result = response.json()
        response_text = result.get("response", "").strip()
        logger.debug(f"Ollama raw response: {response_text[:200]}...")

        # Try to extract JSON from the response
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        if start_idx != -1 and end_idx != -1:
            json_str = response_text[start_idx:end_idx]
            try:
                roadmap = json.loads(json_str)
                if not isinstance(roadmap, dict) or 'project_overview' not in roadmap or 'phases' not in roadmap:
                    logger.error("Invalid roadmap structure - missing required fields")
                    return create_default_roadmap(prompt)
                roadmap['metadata'] = {
                    'generated_at': datetime.now().isoformat(),
                    'prompt': prompt,
                    'version': 'ollama'
                }
                roadmap_cache[cache_key] = roadmap
                logger.info("Roadmap generation completed successfully")
                return roadmap
            except Exception as e:
                logger.error(f"Failed to parse JSON from Ollama response: {e}")
                return create_default_roadmap(prompt)
        else:
            logger.error("No JSON structure found in Ollama response")
            return create_default_roadmap(prompt)
    except Exception as e:
        logger.error(f"Error generating roadmap: {str(e)}")
        return create_default_roadmap(prompt)

def create_default_roadmap(prompt):
    return {
        "project_overview": {
            "name": f"{prompt.title()} Project",
            "description": f"A comprehensive project plan for {prompt}",
            "estimated_duration": "12 weeks",
            "team_size": "4-6 people",
            "objectives": [
                "Deliver a robust and scalable solution",
                "Ensure high code quality",
                "Implement modern best practices"
            ],
            "success_criteria": [
                "Successful deployment",
                "High customer satisfaction",
                "Low defect rate"
            ]
        },
        "phases": {
            "phase1": {
                "name": "Project Initiation",
                "overview": "Initial project setup and planning",
                "duration": "2-3 weeks",
                "objectives": [
                    "Define project scope",
                    "Develop project schedule"
                ],
                "deliverables": [
                    "Project plan document",
                    "Project schedule"
                ],
                "sub_phases": {
                    "sub1": {
                        "name": "Requirements Analysis",
                        "description": "Gather and analyze requirements",
                        "tasks": [
                            "Conduct stakeholder interviews",
                            "Document requirements",
                            "Create specifications"
                        ],
                        "deliverables": [
                            "Requirements document",
                            "Technical specifications"
                        ],
                        "estimated_time": "1-2 weeks"
                    }
                },
                "dependencies": [],
                "risks": ["risk1", "risk2"],
                "milestones": ["milestone1", "milestone2"]
            }
        }
    }

@csrf_exempt
@require_http_methods(["POST"])
@log_request
@validate_request
@validate_auth
def generate_roadmap_view(request):
    try:
        data = json.loads(request.body)
        prompt = data['prompt']
        
        # get the roadmap
        roadmap = generate_roadmap(prompt)
        if not roadmap:
            return JsonResponse({"error": "Failed to generate roadmap"}, status=500)

        
        project_name = roadmap["project_overview"]["name"]

        
        auth_token = request.headers.get('Authorization').split(' ')[1]

        
        django_headers = {
            'Authorization': f'Token {auth_token}',
            'Content-Type': 'application/json'
        }
        
        django_data = {
            'name': project_name,
            'roadmap': roadmap
        }
        
        response = requests.post(
            DJANGO_API_URL,
            headers=django_headers,
            json=django_data
        )
        
        if response.status_code != 201:
            logger.error(f"Failed to save project to Django: {response.text}")
            return JsonResponse({"error": "Failed to save project"}, status=response.status_code)

        return JsonResponse({
            "message": "Roadmap generated and saved successfully",
            "roadmap": roadmap
        })

    except Exception as e:
        logger.error(f"Error in generate_roadmap_view: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@log_request
def clear_cache_view(request):
    try:
        roadmap_cache.clear()
        return JsonResponse({"message": "Cache cleared successfully"})
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
@log_request
@validate_request
def roadmap_view(request):
    try:
        data = json.loads(request.body)
        prompt = data.get('prompt')
        project_name = data.get('project_name')
        duration = data.get('duration')

        # roadmap using existing function
        roadmap = generate_roadmap(prompt)
        
        # project name 
        if project_name:
            roadmap['project_overview']['name'] = project_name
            
        # duration 
        if duration:
            roadmap['project_overview']['estimated_duration'] = duration

        return JsonResponse({
            'status': 'success',
            'roadmap': roadmap
        })
        
    except Exception as e:
        logger.error(f"Error in roadmap_view: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': 'Failed to generate roadmap'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def generate_pdf(request):
    if request.method == 'POST':
        try:
            # content from the request
            data = json.loads(request.body)
            content = data.get('content')
            title = data.get('title', 'Project Roadmap')
            
            # payload for the PDF API
            payload = {
                'content': content,
                'title': title,
                'options': {
                    'format': 'A4',
                    'margin': '20mm',
                    'printBackground': True
                }
            }
            
            # request to the PDF API
            response = requests.post(
                'https://api.market/store/yakpdf/pdf',
                json=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf'
                }
            )
            
            if response.status_code == 200:
                # return PDF data 
                response = HttpResponse(
                    response.content,
                    content_type='application/pdf'
                )
                response['Content-Disposition'] = f'attachment; filename="{title}.pdf"'
                response['Access-Control-Allow-Origin'] = '*'
                response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
                response['Access-Control-Allow-Headers'] = 'Content-Type'
                return response
            else:
                return JsonResponse(
                    {'error': f'PDF generation failed with status {response.status_code}'},
                    status=response.status_code,
                    headers={
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    }
                )
                
        except Exception as e:
            return JsonResponse(
                {'error': str(e)},
                status=500,
                headers={
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            )
            
    # CORS
    if request.method == 'OPTIONS':
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
        
    return JsonResponse(
        {'error': 'Method not allowed'},
        status=405,
        headers={
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    )
    try:
        data = json.loads(request.body)
        prompt = data.get('prompt')
        project_name = data.get('project_name')
        duration = data.get('duration')

        # roadmap using existing function
        roadmap = generate_roadmap(prompt)
        
        # project name 
        if project_name:
            roadmap['project_overview']['name'] = project_name
            
        # duration 
        if duration:
            roadmap['project_overview']['estimated_duration'] = duration

        return JsonResponse({
            'status': 'success',
            'roadmap': roadmap
        })
        
    except Exception as e:
        logger.error(f"Error in roadmap_view: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': 'Failed to generate roadmap'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def generate_pdf(request):
    if request.method == 'POST':
        try:
            # content from the request
            data = json.loads(request.body)
            content = data.get('content')
            title = data.get('title', 'Project Roadmap')
            
            # payload for the PDF API
            payload = {
                'content': content,
                'title': title,
                'options': {
                    'format': 'A4',
                    'margin': '20mm',
                    'printBackground': True
                }
            }
            
            # request to the PDF API
            response = requests.post(
                'https://api.market/store/yakpdf/pdf',
                json=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf'
                }
            )
            
            if response.status_code == 200:
                # return PDF data 
                response = HttpResponse(
                    response.content,
                    content_type='application/pdf'
                )
                response['Content-Disposition'] = f'attachment; filename="{title}.pdf"'
                response['Access-Control-Allow-Origin'] = '*'
                response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
                response['Access-Control-Allow-Headers'] = 'Content-Type'
                return response
            else:
                return JsonResponse(
                    {'error': f'PDF generation failed with status {response.status_code}'},
                    status=response.status_code,
                    headers={
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    }
                )
                
        except Exception as e:
            return JsonResponse(
                {'error': str(e)},
                status=500,
                headers={
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            )
            
    # CORS
    if request.method == 'OPTIONS':
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
        
    return JsonResponse(
        {'error': 'Method not allowed'},
        status=405,
        headers={
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    )

