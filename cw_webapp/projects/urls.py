from django.urls import path
from . import views

app_name = 'projects_1'

urlpatterns = [
    path('list/', views.list_projects, name='list_projects'),
    path('save_project/', views.save_project, name='save_project'),
    path('dev_environment/<int:project_id>/', views.dev_environment, name='dev_environment'),
    path('run_code/', views.run_code, name='run_code'),
    path('save_code/', views.save_code, name='save_code'),
    path('delete_project/<int:project_id>/', views.delete_project, name='delete_project'),
]