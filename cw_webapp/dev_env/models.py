from django.db import models
from django.contrib.auth.models import User
from projects.models import Project

# Create your models here.

class CodeFile(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='code_files')
    name = models.CharField(max_length=255)
    content = models.TextField(default='')
    language = models.CharField(max_length=50, default='python')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.project.name} - {self.name}"
