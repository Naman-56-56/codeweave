from django.urls import path
from . import views
from .views import CustomObtainAuthToken
from django.urls import include

urlpatterns = [
    path('projects/', include('projects.urls', namespace='projects_1')),
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path('create_project/', views.create_project, name='create_project'),
    path("", views.home_view, name="home"),
    path('auth/token/', CustomObtainAuthToken.as_view(), name='token_obtain'),
    path("test-auth/", views.test_user_auth, name="test-auth"),
    path("dashboard/", views.dashboard_view, name="dashboard"),
]