from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    path('generate/', views.generate_response, name='generate_response'),
]
