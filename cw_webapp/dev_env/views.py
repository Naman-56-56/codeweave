from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
import json
import subprocess
import os
import shutil
import logging
from projects.models import Project
from .models import CodeFile

logger = logging.getLogger(__name__)

@login_required
@csrf_exempt
def dev_environment(request, project_id):
    """Render the development environment for a specific project"""
    try:
        project = get_object_or_404(Project, id=project_id, user=request.user)
        
        # Get or create the main code file
        main_file, created = CodeFile.objects.get_or_create(
            project=project,
            name='main.py',
            defaults={'content': '# Your code here\n'}
        )
        
        context = {
            'project': project,
            'main_file': main_file,
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
        file_name = data.get('file_name', 'main.py')

        # Verify project ownership
        project = get_object_or_404(Project, id=project_id, user=request.user)
        
        # Get or create the code file
        code_file, created = CodeFile.objects.get_or_create(
            project=project,
            name=file_name,
            defaults={'content': code}
        )
        
        if not created:
            code_file.content = code
            code_file.save()

        return JsonResponse({"message": "Code saved successfully"})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_code_files(request, project_id):
    """Get all code files for a project"""
    try:
        project = get_object_or_404(Project, id=project_id, user=request.user)
        code_files = CodeFile.objects.filter(project=project)
        
        return JsonResponse({
            "files": [
                {
                    "id": file.id,
                    "name": file.name,
                    "content": file.content,
                    "language": file.language,
                    "updated_at": file.updated_at.isoformat()
                } for file in code_files
            ]
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_code_file(request, project_id):
    """Create a new code file for a project"""
    try:
        project = get_object_or_404(Project, id=project_id, user=request.user)
        data = json.loads(request.body)
        file_name = data.get('name')
        content = data.get('content', '')
        language = data.get('language', 'python')
        
        # Check if file already exists
        if CodeFile.objects.filter(project=project, name=file_name).exists():
            return JsonResponse({"error": "File already exists"}, status=400)
        
        # Create the file
        code_file = CodeFile.objects.create(
            project=project,
            name=file_name,
            content=content,
            language=language
        )
        
        return JsonResponse({
            "message": "File created successfully",
            "file": {
                "id": code_file.id,
                "name": code_file.name,
                "content": code_file.content,
                "language": code_file.language,
                "updated_at": code_file.updated_at.isoformat()
            }
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_code_file(request, project_id, file_id):
    """Delete a code file"""
    try:
        project = get_object_or_404(Project, id=project_id, user=request.user)
        code_file = get_object_or_404(CodeFile, id=file_id, project=project)
        
        # Don't allow deleting main.py
        if code_file.name == 'main.py':
            return JsonResponse({"error": "Cannot delete main.py"}, status=400)
        
        code_file.delete()
        return JsonResponse({"message": "File deleted successfully"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
