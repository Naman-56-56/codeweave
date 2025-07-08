from django.db import models
import json

class RoadmapRequest(models.Model):
    """Model to store user roadmap requests and generated roadmaps"""
    goal = models.TextField(help_text="User's non-tech goal or project idea")
    roadmap_data = models.JSONField(null=True, blank=True, help_text="Generated roadmap from Gemini API")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Roadmap for: {self.goal[:50]}..."
    
    def get_roadmap_phases(self):
        """Return phases from roadmap data (for backward compatibility)"""
        if self.roadmap_data and 'phases' in self.roadmap_data:
            return self.roadmap_data['phases']
        return []
    
    def get_roadmap_title(self):
        """Return the roadmap title"""
        if self.roadmap_data and 'title' in self.roadmap_data:
            return self.roadmap_data['title']
        return f"Roadmap for: {self.goal[:50]}..."
    
    def get_roadmap_description(self):
        """Return the roadmap description"""
        if self.roadmap_data and 'description' in self.roadmap_data:
            return self.roadmap_data['description']
        return ""
    
    def get_prerequisites(self):
        """Return prerequisites"""
        if self.roadmap_data and 'prerequisites' in self.roadmap_data:
            return self.roadmap_data['prerequisites']
        return []
    
    def get_success_metrics(self):
        """Return success metrics"""
        if self.roadmap_data and 'success_metrics' in self.roadmap_data:
            return self.roadmap_data['success_metrics']
        return []
    
    def get_timeline_overview(self):
        """Return timeline overview"""
        if self.roadmap_data and 'timeline_overview' in self.roadmap_data:
            return self.roadmap_data['timeline_overview']
        return ""
    
    def get_budget_considerations(self):
        """Return budget considerations"""
        if self.roadmap_data and 'budget_considerations' in self.roadmap_data:
            return self.roadmap_data['budget_considerations']
        return ""
    
    def get_risk_factors(self):
        """Return risk factors"""
        if self.roadmap_data and 'risk_factors' in self.roadmap_data:
            return self.roadmap_data['risk_factors']
        return []
    
    def get_alternative_paths(self):
        """Return alternative paths"""
        if self.roadmap_data and 'alternative_paths' in self.roadmap_data:
            return self.roadmap_data['alternative_paths']
        return []
    
    def get_goal_category(self):
        """Return the goal category"""
        if self.roadmap_data and 'goal_category' in self.roadmap_data:
            return self.roadmap_data['goal_category']
        return ""
    
    def get_field_specific_data(self):
        """Return field-specific data"""
        if self.roadmap_data and 'field_specific_data' in self.roadmap_data:
            return self.roadmap_data['field_specific_data']
        return {}
    
    def get_field_specific_considerations(self):
        """Return field-specific considerations"""
        if self.roadmap_data and 'field_specific_considerations' in self.roadmap_data:
            return self.roadmap_data['field_specific_considerations']
        return {}
    
    def get_field_specific_resources(self):
        """Return field-specific resources"""
        if self.roadmap_data and 'field_specific_resources' in self.roadmap_data:
            return self.roadmap_data['field_specific_resources']
        return {}
