import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_book.settings')

# Create a Celery instance and configure it.
app = Celery('social_book')

# Load task modules from all registered Django app configs.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all apps
app.autodiscover_tasks()

# This is optional but useful for debugging
@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
