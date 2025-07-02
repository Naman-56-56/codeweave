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
    return f"""Create a detailed project roadmap for: {prompt}

    Return the response in this exact JSON format without any additional text or markdown:
    {{
        "project_overview": {{
            "name": "Project Name",
            "description": "Comprehensive project description",
            "estimated_duration": "Total estimated timeline",
            "team_size": "Recommended team size",
            "objectives": [
                "Clear objective 1 with measurable outcomes",
                "Clear objective 2 with specific goals",
                "Clear objective 3 with defined targets"
            ],
            "success_criteria": [
                "Specific success metric 1",
                "Specific success metric 2",
                "Specific success metric 3"
            ]
        }},
        "phases": {{
            "phase1": {{
                "id": "1",
                "name": "Phase Name",
                "overview": "Detailed phase description",
                "duration": "Phase duration (e.g., 2-3 weeks)",
                "objectives": [
                    "Phase-specific objective 1",
                    "Phase-specific objective 2"
                ],
                "deliverables": [
                    "Concrete deliverable 1",
                    "Concrete deliverable 2"
                ],
                "ide_link": "/devenv.html?phase=1",
                "sub_phases": {{
                    "sub1": {{
                        "name": "Sub-phase Name",
                        "description": "Detailed sub-phase description",
                        "tasks": [
                            "Specific task 1 with clear definition",
                            "Specific task 2 with acceptance criteria",
                            "Specific task 3 with dependencies"
                        ],
                        "deliverables": [
                            "Sub-phase deliverable 1",
                            "Sub-phase deliverable 2"
                        ],
                        "estimated_time": "Sub-phase duration"
                    }},
                    "sub2": {{
                        "name": "Another Sub-phase",
                        "description": "Another detailed description",
                        "tasks": [
                            "More specific tasks with clear outcomes",
                            "Technical requirements and specifications",
                            "Integration points and dependencies"
                        ],
                        "deliverables": [
                            "More concrete deliverables",
                            "Specific outputs and artifacts"
                        ],
                        "estimated_time": "Sub-phase duration"
                    }}
                }},
                "dependencies": [
                    "Dependency 1",
                    "Dependency 2"
                ],
                "risks": [
                    "Potential risk 1 with mitigation strategy",
                    "Potential risk 2 with contingency plan"
                ],
                "milestones": [
                    "Key milestone 1 with completion criteria",
                    "Key milestone 2 with verification method"
                ]
            }}
        }}
    }}

    Important instructions:
    1. Create at least 6 main phases
    2. Each main phase should have 2-4 sub-phases
    3. Provide detailed, specific tasks for each sub-phase
    4. Include realistic time estimates
    5. Ensure dependencies between phases are logical
    6. Add meaningful milestones for each phase
    7. Include comprehensive risk assessment
    8. Each phase must have a unique ID (1-6) and an ide_link pointing to /devenv.html?phase=[phase_id]
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
                    try:
                        response_text = response_text.strip().replace("```json", "").replace("```", "")
                        start_idx = response_text.find('{')
                        end_idx = response_text.rfind('}') + 1
                        if start_idx == -1 or end_idx == -1:
                            return None
                        json_str = response_text[start_idx:end_idx]
                        json_str = re.sub(r",\s*([}\]])", r"\1", json_str)
                        return json.loads(json_str)
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
                    logger.error("Failed to clean/parse JSON properly")
                    logger.info("Falling back to default roadmap")
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

