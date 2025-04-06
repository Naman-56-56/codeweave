from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Project
import logging
import os
import shutil
from django.contrib import messages

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

        # Create the project
        project = Project.objects.create(
            user=request.user,
            name=name,
            roadmap=roadmap  # Save the roadmap directly in the project model
        )

        # Create project directory for any additional files
        project_dir = os.path.join(os.getcwd(), 'projects', str(project.id))
        os.makedirs(project_dir, exist_ok=True)

        return JsonResponse({
            "message": "Project saved successfully",
            "project": {
                "id": project.id,
                "name": project.name,
                "created_at": project.created_at.isoformat(),
                "roadmap": project.roadmap
            }
        }, status=201)

    except Exception as e:
        logger.error(f"Error saving project: {str(e)}")
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

@login_required
def dev_environment(request, project_id):
    """
    View function to render the development environment template for a specific project.
    """
    try:
        project = Project.objects.get(id=project_id, user=request.user)
        context = {
            'project': project,
            'project_id': project_id
        }
        return render(request, 'dev_environment.html', context)
    except Project.DoesNotExist:
        messages.error(request, 'Project not found or you do not have permission to access it.')
        return redirect('dashboard')
