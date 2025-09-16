import graphene
from graphene_django.types import DjangoObjectType
from .models import Profile, FollowersCount, Post, LikePost, User
from graphql_jwt.decorators import login_required
import graphql_jwt
import random
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
from django.db.models import Prefetch
from django.core.cache import cache
from social_book.utils.rabbitmq import publish_to_queue

# --- Object Types ---
# These classes define the GraphQL types for your Django models.

class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'username', 'email','first_name','last_name','profile','posts','date_joined')
        
class ProfileType(DjangoObjectType):
    followers_count = graphene.Int()
    following_count = graphene.Int()
    is_following = graphene.Boolean()
    
    class Meta:
        model = Profile
        fields = ('id', 'user', 'bio','profileimg','location','followers_count','following_count','is_following','location')
        

    def resolve_followers_count(self, info):
        return FollowersCount.objects.filter(user=self.user).count()

    def resolve_following_count(self, info):
        return FollowersCount.objects.filter(follower=self.user).count()
        
    @login_required
    def resolve_is_following(self, info):
        current_user = info.context.user
        return FollowersCount.objects.filter(follower=current_user, user=self.user).exists()

class PostType(DjangoObjectType):
    class Meta:
        model = Post
        fields = ('id', 'user','image', 'caption','description', 'created_at', 'likes')
        ordering = ['-created_at']  # Default ordering for all queries
        
class LikePostType(DjangoObjectType):
    class Meta:
        model = LikePost
        fields = ('id', 'post', 'user')

class FollowersCountType(DjangoObjectType):
    class Meta:
        model = FollowersCount
        fields = ('id', 'follower', 'user')

class CreatePost(graphene.Mutation):
    class Arguments:
        image = graphene.String(required=True)  # Base64 string
        caption = graphene.String(required=False)
        description = graphene.String(required=False)
    
    post = graphene.Field(PostType)

    @login_required
    def mutate(self, info, image, caption, description=None):
        user = info.context.user
        
        # Create the post
        post = Post(
            user=user, 
            caption=caption,
            description=description
        )
        post.save()        


        message_payload = {
            'post_id':str(post.id),
            'image_base64_data':image
        }

        publish_to_queue("image_processing_queue", message_payload)

        # Return the post object immediately. The frontend can display a placeholder
        # and refresh to see the processed image when it's ready.
        return CreatePost(post=post)
        

class UpdateProfile(graphene.Mutation):
    class Arguments:
        bio = graphene.String()
        profile_img = graphene.String()
        
    profile = graphene.Field(ProfileType)

    @login_required
    def mutate(self, info, bio=None, profile_img=None):
        user = info.context.user
        profile = user.profile
        if bio is not None:
            profile.bio = bio
        if profile_img is not None:
            profile.profileimg = profile_img
        profile.save()
        return UpdateProfile(profile=profile)

class FollowUser(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
    
    followed = graphene.Boolean()
    message = graphene.String()

    @login_required
    def mutate(self, info, username):
        follower = info.context.user
        try:
            followedUser = User.objects.get(username=username)
        except User.DoesNotExist:
            raise Exception("user with username doesn't exist")
        
        is_following = FollowersCount.objects.filter(follower=follower, user=followedUser).exists()

        if is_following:
            FollowersCount.objects.get(follower=follower, user=followedUser).delete()
            # Invalidate the caches after unfollowing
            cache.delete(f'graphql_profile_{username}')
            cache.delete(f'graphql_profile_{follower.username}')
            cache.delete(f'graphql_suggestions_{follower.id}')
            return FollowUser(followed=False, message=f"Successfully unfollowed {username}.")
        else:
            FollowersCount.objects.create(follower=follower, user=followedUser)
            # Invalidate the caches after following
            cache.delete(f'graphql_profile_{username}')
            cache.delete(f'graphql_profile_{follower.username}')
            cache.delete(f'graphql_suggestions_{follower.id}')
            return FollowUser(followed=True, message=f"Successfully followed {username}.")
        
        
class LikePostMutation(graphene.Mutation):
    class Arguments:
        post_id = graphene.UUID(required=True)
    
    liked = graphene.Boolean()
    likes = graphene.List(LikePostType)
    message = graphene.String()

    @login_required
    def mutate(self, info, post_id):
        user = info.context.user
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return LikePostMutation(liked=False, likes=[], message="Post not found.")
        
        try:
            LikePost.objects.get(post=post, user=user).delete()
            liked = False
        except LikePost.DoesNotExist:
            LikePost.objects.create(post=post, user=user)
            liked = True

        likes = LikePost.objects.filter(post_id=post_id)
        return LikePostMutation(liked=liked, likes=likes,message="changed successfully")


class Mutation(graphene.ObjectType):
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()


    create_post = CreatePost.Field()
    update_profile = UpdateProfile.Field()
    follow_user = FollowUser.Field()
    like_post = LikePostMutation.Field()
   

# --- Queries ---
# These classes define how to retrieve data.

class Query(graphene.ObjectType):
    profile = graphene.Field(ProfileType, username=graphene.String())
    my_profile = graphene.Field(ProfileType)
    search_profiles = graphene.List(ProfileType, username=graphene.String())
    feed = graphene.List(PostType)
    suggestions = graphene.List(ProfileType)

    @login_required
    def resolve_my_profile(self,info):
        current_user = info.context.user
        profile = Profile.objects.select_related('user').get(user=current_user)
        return profile

    @login_required
    def resolve_profile(self, info, username):
        cache_key = f'graphql_profile_{username}'
        cached_profile = cache.get(cache_key)
        # cached_profile = None
        
        if cached_profile:
            print("Fetching profile from cache.")
            return cached_profile
        
        print("Fetching profile from DB and setting cache.")

        try:
            # Use select_related and prefetch_related to optimize queries
            user = User.objects.select_related('profile').prefetch_related(
                Prefetch(
                    'posts',
                    queryset=Post.objects.select_related('user').prefetch_related(
                        Prefetch(
                            'likes',
                            queryset=LikePost.objects.select_related('user')
                        )
                    ).order_by('-created_at')
                )
            ).get(username=username)
            profile = user.profile
            cache.set(cache_key, profile, 60 * 60 * 2) # Cache for 2 hours
            return profile
        except User.DoesNotExist:
            return None

    @login_required
    def resolve_search_profiles(self, info, username):
        if not username:
            return []
        
        cache_key = f'graphql_search_profiles_{username}'
        cached_data = cache.get(cache_key)
        if cached_data:
            print("Fetching from cache.")
            return cached_data
        
        print("Fetching from DB and setting cache.")
        users = User.objects.filter(username__icontains=username)
        profiles = list(Profile.objects.filter(user__in=users))
        
        cache.set(cache_key, profiles, 60 * 60) # Cache for 1 hour
        return profiles

    @login_required
    def resolve_feed(self, info):
        current_user = info.context.user
        
        # Get following user IDs
        following_user_ids = FollowersCount.objects.filter(
            follower=current_user
        ).values_list('user__id', flat=True)
        
        if not following_user_ids:
            # Show popular posts or posts from suggested users for exploration
            return Post.objects.all().select_related('user').prefetch_related('likes')\
                    .annotate(like_count=Count('likes'))\
                    .order_by('-like_count', '?')[:8]  # Popular posts first, then random
    
        
        # Get recent posts (last 7 days) ordered by engagement
        recent_posts = Post.objects.filter(
            user__id__in=following_user_ids,
            created_at__gte=timezone.now() - timedelta(days=7)
        ).select_related('user').prefetch_related('likes')
        
        # Get older posts for filling the feed
        older_posts = Post.objects.filter(
            user__id__in=following_user_ids,
            created_at__lt=timezone.now() - timedelta(days=7)
        ).select_related('user').prefetch_related('likes')
        
        # Convert to lists and shuffle within categories
        recent_posts_list = list(recent_posts)
        older_posts_list = list(older_posts)
        
        random.shuffle(recent_posts_list)
        random.shuffle(older_posts_list)
        
        # Combine with priority for recent posts
        feed_posts = recent_posts_list + older_posts_list
        
        return feed_posts

    @login_required
    def resolve_suggestions(self, info):
        current_user = info.context.user
        cache_key = f'graphql_suggestions_{current_user.id}'
        cached_suggestions = cache.get(cache_key)

        if cached_suggestions:
            print("Fetching suggestions from cache.")
            return cached_suggestions

        print("Fetching suggestions from DB and setting cache.")
        following_user_ids = FollowersCount.objects.filter(follower=current_user).values_list('user__id', flat=True)
        exclude_ids = list(following_user_ids) + [current_user.id]
        
        suggestions_users = list(User.objects.exclude(id__in=exclude_ids).order_by('?')[:4])
        
        profiles = list(Profile.objects.filter(user__in=suggestions_users))
        cache.set(cache_key, profiles, 60 * 15) # Cache for 15 minutes
        return profiles

