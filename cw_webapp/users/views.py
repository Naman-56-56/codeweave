from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import login, get_backends
from rest_framework.authtoken.models import Token
from django.http import JsonResponse, HttpResponseRedirect
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from projects.models import Project
import logging
from datetime import date, datetime

# Set up logging
logger = logging.getLogger(__name__)

_all_ = ['CustomObtainAuthToken', 'register_view', 'login_view', 'logout_view', 'home_view', 'test_user_auth']

class CustomObtainAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})

# User Registration View
def register_view(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Create or get auth token
            token, _ = Token.objects.get_or_create(user=user)
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            messages.success(request, "Registration successful! Welcome.")
            # Return HTTP redirect instead of JSON response
            return HttpResponseRedirect('/users/dashboard/')
        else:
            messages.error(request, "Error registering. Please try again.")
            return JsonResponse({"errors": form.errors}, status=400)
    else:
        form = UserCreationForm()
    
    return render(request, "register.html", {"form": form})

# User Login View
def login_view(request):
    if request.method == "POST":
        # Log the request details for debugging
        logger.info(f"Login POST request - Headers: {dict(request.headers)}")
        logger.info(f"Login POST request - POST data: {dict(request.POST)}")
        
        # Always handle as AJAX request to prevent page redirects
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        logger.info(f"Processing login - Username: {username}, Password provided: {bool(password)}")
        
        if not username or not password:
            logger.warning("Login failed - Missing username or password")
            return JsonResponse({
                "message": "Username and password are required.",
                "errors": {"__all__": ["Username and password are required."]}
            }, status=400)
        
        # Authenticate user
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            # Create or get auth token
            token, _ = Token.objects.get_or_create(user=user)
            logger.info(f"Login successful for user: {username}")
            # Return HTTP redirect instead of JSON response
            return HttpResponseRedirect('/users/dashboard/')
        else:
            logger.warning(f"Login failed for username: {username}")
            return JsonResponse({
                "message": "Invalid username or password.",
                "errors": {"__all__": ["Invalid username or password."]}
            }, status=400)
    
    else:
        form = AuthenticationForm()

    return render(request, "login.html", {"form": form})

# User Logout View
def logout_view(request):
    logout(request)
    messages.info(request, "Logged out successfully.")
    return redirect("users:login")

# Dashboard View (Only Accessible After Login)
@login_required
def dashboard_view(request):
    # Get today's date and current month/week
    today = date.today()
    current_month = today.month
    current_year = today.year
    current_week = today.isocalendar()[1]

    # Project statistics
    projects = Project.objects.filter(user=request.user)
    total_projects = projects.count()
    projects_this_month = projects.filter(created_at__year=current_year, created_at__month=current_month).count()

    # Active tasks statistics
    # TODO: Replace with your actual Task model and logic
    total_active_tasks = 0
    active_tasks_today = 0
    # Example:
    # from tasks.models import Task
    # active_tasks = Task.objects.filter(project__user=request.user, status='active')
    # total_active_tasks = active_tasks.count()
    # active_tasks_today = active_tasks.filter(created_at__date=today).count()

    # Team members statistics
    # TODO: Replace with your actual TeamMember model and logic
    total_team_members = 0
    team_members_this_week = 0
    # Example:
    # from teams.models import TeamMember
    # team_members = TeamMember.objects.filter(project__user=request.user)
    # total_team_members = team_members.count()
    # team_members_this_week = team_members.filter(created_at__year=current_year, created_at__week=current_week).count()

    overview = {
        "total_projects": total_projects,
        "projects_this_month": projects_this_month,
        "total_active_tasks": total_active_tasks,
        "active_tasks_today": active_tasks_today,
        "total_team_members": total_team_members,
        "team_members_this_week": team_members_this_week,
    }

    projects_data = [{
        'id': project.id,
        'name': project.name,
        'created_at': project.created_at,
        'roadmap': project.roadmap
    } for project in projects]

    return render(request, "dashboard.html", {
        "projects": projects_data,
        "overview": overview
    })

def create_project(request):
    return render(request, 'app.html')


def home_view(request):
    return render(request, "index.html")

def features_view(request):
    return render(request, "features.html")

def pay_view(request):
    return render(request, "pay.html")

from django.contrib.auth import get_user
from django.http import JsonResponse

def test_user_auth(request):
    user = get_user(request)
    return JsonResponse({"logged_in_user": str(user)})

def profile_view(request):
    # Simple placeholder view for user profile
    return render(request, "profile.html")

def settings_view(request):
    # Simple placeholder view for user settings
    return render(request, "settings.html")

def notifications_view(request):
    # Simple placeholder view for user notifications
    return render(request, "notifications.html")

def security_view(request):
    # Simple placeholder view for user security settings
    return render(request, "security.html")

def help_support_view(request):
    # Simple placeholder view for help and support
    return render(request, "help_support.html")
