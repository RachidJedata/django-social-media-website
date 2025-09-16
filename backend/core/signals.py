from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Post, FollowersCount, LikePost, User, Profile
from .tasks import send_welcome_email 

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
        # Asynchronously send the welcome email
        send_welcome_email.delay(user_email=instance.email)


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



@receiver(post_save, sender=User)
def clear_search_cache_on_user_update(sender, instance, **kwargs):
    """
    Clears the search cache for a specific user when their profile or user object is saved.
    """
    cache_key = f'search_results_{instance.username}'
    cache.delete(cache_key)

@receiver(post_save, sender=Profile)
def clear_search_cache_on_profile_update(sender, instance, **kwargs):
    """
    Clears the search cache for a user when their profile is updated.
    """
    cache_key = f'search_results_{instance.user.username}'
    cache.delete(cache_key)


@receiver(post_save, sender=Post)
@receiver(post_delete, sender=Post)
def invalidate_post_caches(sender, instance, **kwargs):
    """
    Invalidates caches when a post is created, updated, or deleted.
    """
    # Invalidate the cache for the specific post
    # The key for a single post is likely based on its ID.
    cache_key_post_retrieve = f"views.decorators.cache.cache_page./posts/{instance.id}/"
    cache.delete(cache_key_post_retrieve)
    
    # Invalidate the cache for the list of all posts
    cache_key_post_list = "views.decorators.cache.cache_page./posts/"
    cache.delete(cache_key_post_list)


    # Invalidate the cache for the user's profile, since a post was changed
    invalidate_profile_cache(instance.user)

@receiver(post_save, sender=LikePost)
@receiver(post_delete, sender=LikePost)
def invalidate_post_caches_on_like_change(sender, instance, **kwargs):
    """
    Invalidates the cache for a specific post when it is liked or unliked.
    """
    # Invalidate the cache for the specific post
    cache_key = f"views.decorators.cache.cache_page./posts/{instance.post.id}/"
    cache.delete(cache_key)

@receiver(post_save, sender=FollowersCount)
@receiver(post_delete, sender=FollowersCount)
def invalidate_profile_caches_on_follow(sender, instance, **kwargs):
    """
    Invalidates the cache for both the follower and the followed user's profiles.
    """
    # Invalidate the cache of the person who was followed/unfollowed
    invalidate_profile_cache(User.objects.get(username=instance.user))

    # Invalidate the cache of the person who performed the follow/unfollow action
    invalidate_profile_cache(User.objects.get(username=instance.follower))


def invalidate_profile_cache(user_or_post):
    """
    Helper function to invalidate the cache for a given user's profile view.
    It works for a User object or a Post object.
    """
    if isinstance(user_or_post, User):
        username = user_or_post.username
    elif isinstance(user_or_post, Post):
        username = user_or_post.user.username
    else:
        return # Do nothing if it's not a User or a Post


    cache_key = f'graphql_profile_{username}'
    cache.delete(cache_key)