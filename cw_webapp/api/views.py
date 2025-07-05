from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import google.generativeai as genai
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
genai.configure(api_key=GOOGLE_API_KEY)


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

        logger.info("Initializing generative model: models/gemini-2.5-flash-preview-05-20")
        model = genai.GenerativeModel('models/gemini-2.5-flash-preview-05-20')
        logger.info(f"Model initialized. Generating content...")

        response = model.generate_content(
            get_prompt_template(prompt),
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=1,
                top_k=32,
                max_output_tokens=8192
            )
        )
        logger.info("Model response received.")

        if not response or not hasattr(response, "text") or not response.text.strip():
            logger.error("No response text generated — likely due to token limit or model cutoff.")
            logger.info("Falling back to retry with simplified prompt.")
            raise ValueError("Empty response from Gemini — finish_reason likely indicates cutoff.")

        
        if not response or not response.text:
            logger.error("No response generated from model")
            return create_default_roadmap(prompt)

        try:
            response_text = response.text.strip()
            logger.debug(f"Raw response text: {response_text[:200]}...")
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            logger.debug(f"JSON extraction indices: start={start_idx}, end={end_idx}")
            
            if start_idx != -1 and end_idx != -1:
                logger.debug("Attempting to clean and parse model response...")
                def clean_and_parse_json(response_text):
                    import re
                    import json5
                    try:
                        response_text = response_text.strip().replace("```json", "").replace("```", "")
                        start_idx = response_text.find('{')
                        end_idx = response_text.rfind('}') + 1
                        if start_idx == -1 or end_idx == -1:
                            return None

                        json_str = response_text[start_idx:end_idx]
                        json_str = re.sub(r",\s*([}\]])", r"\1", json_str)

                        # Check if the JSON ends properly
                        if not json_str.strip().endswith('}') and not json_str.strip().endswith(']'):
                            raise ValueError("Response JSON appears incomplete or cut off.")

                        return json5.loads(json_str)

                    except Exception as e:
                        logger.error(f"Failed to clean and parse JSON: {e}")
                        return None



                roadmap = clean_and_parse_json(response_text)
                if roadmap:
                    logger.info("JSON parsed successfully.")
                    if not isinstance(roadmap, dict) or 'project_overview' not in roadmap or 'phases' not in roadmap:
                        logger.error("Invalid roadmap structure - missing required fields")
                        logger.info("Falling back to default roadmap")
                        return create_default_roadmap(prompt)

                    roadmap['metadata'] = {
                        'generated_at': datetime.now().isoformat(),
                        'prompt': prompt,
                        'version': '2.0'
                    }
                    roadmap_cache[cache_key] = roadmap
                    logger.info("Roadmap generation completed successfully")
                    return roadmap
                else:
                    logger.warning("Initial parse failed. Retrying with simplified prompt...")
                    short_prompt = (
                        f"""Create a concise but complete project roadmap for: {prompt}

                    Respond in **raw JSON** ONLY, no markdown or extra text.

                    Your response MUST include these two top-level keys:
                    - "project_overview"
                    - "phases"

                    Limit to 4 main phases, each with 1–2 subphases.
                    Keep each task brief and realistic. Close all brackets and avoid trailing commas."""
                    )

                    os.makedirs("logs", exist_ok=True)
                    with open("logs/invalid_retry_output.json", "w", encoding="utf-8") as f:
                        json.dump(roadmap, f, indent=2)



                    try:
                        retry_response = model.generate_content(
                            short_prompt,
                            generation_config=genai.types.GenerationConfig(
                                temperature=0.7,
                                top_p=1,
                                top_k=32,
                                max_output_tokens=6144  # safer token limit
                            )
                        )
                        try:
                            roadmap = clean_and_parse_json(retry_response.text)

                            # ✅ NEW: Check if roadmap is a valid dict
                            if not roadmap or not isinstance(roadmap, dict):
                                logger.error("Retry returned non-dict response. Type: %s", type(roadmap))
                                logger.warning(f"Retry parsed value: {roadmap}")
                                return create_default_roadmap(prompt)

                            # ✅ Also check if required keys exist
                            if "project_overview" not in roadmap or "phases" not in roadmap:
                                logger.error("Retry missing required keys.")
                                logger.warning(f"Retry result: {roadmap}")
                                return create_default_roadmap(prompt)

                            logger.info("Retry succeeded. JSON parsed.")

                            roadmap['metadata'] = {
                                'generated_at': datetime.now().isoformat(),
                                'prompt': prompt,
                                'version': '2.0 (retry)'
                            }
                            roadmap_cache[cache_key] = roadmap
                            return roadmap

                        except Exception as e:
                            logger.error(f"Retry parsing failed: {str(e)}")
                            return create_default_roadmap(prompt)

                    except Exception as retry_err:
                        logger.error(f"Retry generation error: {retry_err}")
                        return create_default_roadmap(prompt)

                

            else:
                logger.error("No JSON structure found in response")
                return create_default_roadmap(prompt)
        except Exception as e:
            logger.error(f"Error processing response: {str(e)}")
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

