from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Links to the user who created it
    name = models.CharField(max_length=255)  # Project name
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp
    roadmap = models.JSONField(null=True, blank=True)  # Store the roadmap JSON data

    def __str__(self):
        return f"{self.name} - {self.user.username}"
