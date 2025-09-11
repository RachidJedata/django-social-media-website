from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    def ready(self):
        """
        This method is called by Django when the app is ready.
        It's the recommended place to import signal handlers.
        """
        # Import your signals module to connect the signal handlers.
        import core.signals