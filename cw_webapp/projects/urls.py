from django.urls import path
from . import views
from .views import get_project_roadmap

app_name = 'projects_1'

urlpatterns = [
    path('list/', views.list_projects, name='list_projects'),
    path('save_project/', views.save_project, name='save_project'),
    path('delete/<int:project_id>/', views.delete_project, name='delete_project'),
    path('dev_environment/<int:project_id>/', views.dev_environment, name='dev_environment'),
]

urlpatterns += [
    path('<int:project_id>/roadmap/', get_project_roadmap, name='get_project_roadmap'),
]