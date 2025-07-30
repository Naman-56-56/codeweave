from django import template
from django.template.loader import render_to_string

register = template.Library()

@register.simple_tag
def navbar():
    return render_to_string('navbar.html') 