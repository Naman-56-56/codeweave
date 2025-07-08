from django import forms

class RoadmapGoalForm(forms.Form):
    """Form for collecting user's non-tech goal"""
    goal = forms.CharField(
        label="What's your non-tech goal or project idea?",
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 4,
            'placeholder': 'e.g., Start a small bakery business, Learn to play guitar, Write a children\'s book, Start a fitness journey...'
        }),
        help_text="Describe your goal in detail for better roadmap generation",
        max_length=1000
    ) 