from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Project
import subprocess
import docker
import logging
import os
import shutil

logger = logging.getLogger(__name__)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def list_projects(request):
    """Get all projects for the authenticated user"""
    try:
        projects = Project.objects.filter(user=request.user).order_by('-created_at')
        return JsonResponse({
            "projects": [
                {
                    "id": project.id,
                    "name": project.name,
                    "created_at": project.created_at.isoformat()
                } for project in projects
            ]
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def save_project(request):
    """Save a generated project for the authenticated user"""
    try:
        data = json.loads(request.body)
        name = data.get("name")
        roadmap = data.get("roadmap")  # Store the roadmap if provided

        project = Project.objects.create(user=request.user, name=name)
        project.save()

        # Create project directory and save roadmap if provided
        if roadmap:
            project_dir = os.path.join(os.getcwd(), 'projects', str(project.id))
            os.makedirs(project_dir, exist_ok=True)
            
            with open(os.path.join(project_dir, 'roadmap.json'), 'w') as f:
                json.dump(roadmap, f, indent=2)

        return JsonResponse({
            "message": "Project saved successfully",
            "project": {
                "id": project.id,
                "name": project.name,
                "created_at": project.created_at.isoformat()
            }
        }, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@login_required
@csrf_exempt
def dev_environment(request, project_id):
    """Render the development environment for a specific project"""
    try:
        project = get_object_or_404(Project, id=project_id, user=request.user)
        
        context = {
            'project': project,
            'container_id': None
        }
        return render(request, 'dev_environment.html', context)
        
    except Exception as e:
        logger.error(f"Error in dev_environment: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def run_code(request):
    """Run code with user verification"""
    try:
        data = json.loads(request.body)
        code = data.get('code')
        project_id = data.get('project_id')

        # Verify project ownership
        project = get_object_or_404(Project, id=project_id, user=request.user)

        # Create a temporary directory for the project
        temp_dir = os.path.join(os.getcwd(), 'temp', str(project.id))
        os.makedirs(temp_dir, exist_ok=True)

        # Write code to a temporary file
        temp_file = os.path.join(temp_dir, 'temp.py')
        with open(temp_file, 'w') as f:
            f.write(code)

        # Run the code
        result = subprocess.run(['python', temp_file], 
                              capture_output=True, 
                              text=True,
                              timeout=10)

        # Clean up
        os.remove(temp_file)
        if os.path.exists(temp_dir) and not os.listdir(temp_dir):
            os.rmdir(temp_dir)

        if result.returncode == 0:
            return JsonResponse({"output": result.stdout})
        else:
            return JsonResponse({"error": result.stderr}, status=400)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def save_code(request):
    """Save code for a project with user verification"""
    try:
        data = json.loads(request.body)
        project_id = data.get('project_id')
        code = data.get('code')

        # Verify project ownership
        project = get_object_or_404(Project, id=project_id, user=request.user)
        
        # Create project directory if it doesn't exist
        project_dir = os.path.join(os.getcwd(), 'projects', str(project_id))
        os.makedirs(project_dir, exist_ok=True)

        # Save the code to main.py
        with open(os.path.join(project_dir, 'main.py'), 'w') as f:
            f.write(code)

        return JsonResponse({"message": "Code saved successfully"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_project(request, project_id):
    """Delete a project for the authenticated user"""
    try:
        project = get_object_or_404(Project, id=project_id, user=request.user)
        
        # Delete project directory if it exists
        project_dir = os.path.join(os.getcwd(), 'projects', str(project_id))
        if os.path.exists(project_dir):
            shutil.rmtree(project_dir)
        
        project.delete()
        return JsonResponse({"message": "Project deleted successfully"})
    
    except Exception as e:
        logger.error(f"Error deleting project: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
