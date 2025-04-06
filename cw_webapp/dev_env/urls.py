from django.urls import path
from . import views

app_name = 'dev_env'

urlpatterns = [
    path('projects/dev_environment/<int:project_id>/', views.dev_environment, name='dev_environment'),
    path('run_code/', views.run_code, name='run_code'),
    path('save_code/', views.save_code, name='save_code'),
    path('files/<int:project_id>/', views.get_code_files, name='get_code_files'),
    path('files/<int:project_id>/create/', views.create_code_file, name='create_code_file'),
    path('files/<int:project_id>/<int:file_id>/', views.delete_code_file, name='delete_code_file'),
] 