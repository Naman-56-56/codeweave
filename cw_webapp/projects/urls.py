from django.urls import path
from . import views

app_name = 'projects_1'

urlpatterns = [
    path('list/', views.list_projects, name='list_projects'),
    path('save_project/', views.save_project, name='save_project'),
    path('delete/<int:project_id>/', views.delete_project, name='delete_project'),
    path('dev_environment/<int:project_id>/', views.dev_environment, name='dev_environment'),
]