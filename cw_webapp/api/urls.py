from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    path('roadmap/', views.generate_roadmap_view, name='generate_roadmap'),
    path('roadmap/cache/clear/', views.clear_cache_view, name='clear_cache'),
]
