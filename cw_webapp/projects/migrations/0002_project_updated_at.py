from django.db import migrations, models
import django.utils.timezone

def set_default_updated_at(apps, schema_editor):
    Project = apps.get_model('projects', 'Project')
    for project in Project.objects.all():
        project.updated_at = project.created_at
        project.save()

class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='updated_at',
            field=models.DateTimeField(null=True),
        ),
        migrations.RunPython(set_default_updated_at),
        migrations.AlterField(
            model_name='project',
            name='updated_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ] 