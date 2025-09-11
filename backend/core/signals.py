from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Profile, User


# This signal handler creates a Profile only when a new User is created.
# We use the 'created' flag to ensure it doesn't run on every user save.
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Handles the creation of a user's profile.
    
    If the user is newly created (`created` is True), this function creates
    a corresponding Profile object.
    
    The keyword argument passed to Profile.objects.create() must match the
    `name` of the ForeignKey field in the Profile model.
    """
    if created:
        Profile.objects.create(user=instance)


# This signal handler will be called every time a User object is deleted.
@receiver(post_delete, sender=User)
def delete_user_profile(sender, instance, **kwargs):
    """
    Handles the deletion of a user's profile.
    
    When a User object is deleted, this function automatically deletes the
    associated Profile object, preventing orphaned records.
    """
    try:
        # We need to use `instance.profile` here because that's the name
        # of the related object created by the ForeignKey.
        instance.profile.delete()
    except Profile.DoesNotExist:
        pass # The profile might have already been deleted.
