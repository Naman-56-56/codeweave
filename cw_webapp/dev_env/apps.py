from django.apps import AppConfig


class DevEnvConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dev_env'
