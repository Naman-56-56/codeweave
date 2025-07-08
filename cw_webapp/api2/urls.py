from django.urls import path
from . import views

app_name = 'api2'

urlpatterns = [
    path('', views.home, name='home'),
    path('result/<int:request_id>/', views.roadmap_result, name='roadmap_result'),
    path('api/generate/', views.generate_roadmap_api, name='generate_roadmap_api'),
    path('history/', views.roadmap_history, name='roadmap_history'),
    path('roadmap/', views.generate_roadmap_api, name='generate_nontech'),
] 