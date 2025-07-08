from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import logging
import os
import google.generativeai as genai
from django.conf import settings
import uuid
from datetime import datetime

from .forms import RoadmapGoalForm
from .models import RoadmapRequest
from .gemini_api import GeminiRoadmapGenerator

# Set up logging
logger = logging.getLogger(__name__)

def home(request):
    """Home page with goal input form"""
    if request.method == 'POST':
        form = RoadmapGoalForm(request.POST)
        if form.is_valid():
            goal = form.cleaned_data['goal']
            
            # Save the request
            roadmap_request = RoadmapRequest.objects.create(goal=goal)
            
            try:
                # Generate roadmap using Gemini API - FRESH DATA EVERY TIME
                generator = GeminiRoadmapGenerator()
                roadmap_data = generator.generate_roadmap(goal)
                
                # Save the generated roadmap
                roadmap_request.roadmap_data = roadmap_data
                roadmap_request.save()
                
                logger.info(f"Successfully generated roadmap for goal: {goal}")
                
                # Redirect to results page
                return redirect('roadmap:roadmap_result', request_id=roadmap_request.id)
                
            except Exception as e:
                logger.error(f"Error generating roadmap for goal '{goal}': {str(e)}")
                messages.error(request, f"Error generating roadmap: {str(e)}")
                # Delete the request if generation failed
                roadmap_request.delete()
                return redirect('roadmap:home')
    else:
        form = RoadmapGoalForm()
    
    return render(request, 'roadmap/home.html', {'form': form})

def roadmap_result(request, request_id):
    """Display the generated roadmap"""
    try:
        roadmap_request = RoadmapRequest.objects.get(id=request_id)
        
        # Extract phases from the new structure
        phases = []
        if roadmap_request.roadmap_data and 'phases' in roadmap_request.roadmap_data:
            phases = roadmap_request.roadmap_data['phases']
        
        return render(request, 'roadmap/roadmap_result.html', {
            'roadmap_request': roadmap_request,
            'phases': phases
        })
    except RoadmapRequest.DoesNotExist:
        messages.error(request, "Roadmap not found.")
        return redirect('roadmap:home')

@csrf_exempt
@require_http_methods(["POST"])
def generate_roadmap_api(request):
    try:
        print("🔧 Received request body:", request.body)
        data = json.loads(request.body)
        goal = data.get('goal', '').strip()

        if not goal:
            return JsonResponse({'error': 'Goal is required'}, status=400)

        print(f"🔨 Goal received: {goal}")

        generator = GeminiRoadmapGenerator()
        roadmap_data = generator.generate_roadmap(goal)

        roadmap_request = RoadmapRequest.objects.create(
            goal=goal,
            roadmap_data=roadmap_data
        )

        print("✅ Roadmap generated and saved.")

        return JsonResponse({
            'success': True,
            'roadmap': roadmap_data,
            'request_id': roadmap_request.id
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("🚨 Exception occurred:", str(e))
        return JsonResponse({'error': str(e)}, status=500)

def roadmap_history(request):
    """Show history of generated roadmaps"""
    roadmaps = RoadmapRequest.objects.all()[:10]  # Show last 10
    return render(request, 'roadmap/roadmap_history.html', {
        'roadmaps': roadmaps
    })

generate_roadmap_view = generate_roadmap_api