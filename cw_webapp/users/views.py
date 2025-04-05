from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import login, get_backends
from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response

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
            return JsonResponse({
                "message": "Registration successful",
                "token": token.key,
                "redirect": "/dashboard/"
            })
        else:
            messages.error(request, "Error registering. Please try again.")
            return JsonResponse({"errors": form.errors}, status=400)
    else:
        form = UserCreationForm()
    
    return render(request, "register.html", {"form": form})

# User Login View
def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            # Create or get auth token
            token, _ = Token.objects.get_or_create(user=user)
            messages.success(request, "Login successful! Redirecting...")
            return JsonResponse({
                "message": "Login successful",
                "token": token.key,
                "redirect": "/dashboard/"
            })
        else:
            messages.error(request, "Invalid username or password.")
            return JsonResponse({"errors": form.errors}, status=400)
    
    else:
        form = AuthenticationForm()

    return render(request, "login.html", {"form": form})

# User Logout View
def logout_view(request):
    logout(request)
    messages.info(request, "Logged out successfully.")
    return redirect("login")

# Dashboard View (Only Accessible After Login)
@login_required
def dashboard_view(request):
    return render(request, "dashboard.html")

def create_project(request):
    return render(request, 'app.html')


def home_view(request):
    return render(request, "index.html")

from django.contrib.auth import get_user
from django.http import JsonResponse

def test_user_auth(request):
    user = get_user(request)
    return JsonResponse({"logged_in_user": str(user)})

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from projects.models import Project 

@login_required
def dashboard_view(request):
    projects = Project.objects.filter(user=request.user)  # Fetch only the logged-in user's projects
    return render(request, "dashboard.html", {"projects": projects})