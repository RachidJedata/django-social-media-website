# schema.py

import graphene
from graphene_django.types import DjangoObjectType
from .models import Profile, FollowersCount, Post, LikePost, User
from graphql_jwt.decorators import login_required
from django.core.files.storage import default_storage
import graphql_jwt
from django.core.files.base import ContentFile
import base64
from django.conf import settings
import datetime
import uuid
from django.db.models import Prefetch


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
        

         # Handle base64 image
        if ';base64,' in image:
            format, imgstr = image.split(';base64,')
            ext = format.split('/')[-1]
    
            
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            
            # Generate a unique filename
            filename = f"{user.id}_{timestamp}_{uuid.uuid4().hex}.{ext}"
            
            # Decode the base64 image
            data = ContentFile(base64.b64decode(imgstr), name=filename)
            
            # Save the file
            file_path = default_storage.save(filename, data)
            image_url = settings.MY_DOMAIN + default_storage.url(file_path)

            
            
            # Create the post
            post = Post(
                user=user, 
                image=image_url,
                caption=caption,
                description=description
            )
            post.save()
            
            return CreatePost(post=post)
        else:
            raise Exception("Invalid image format")
        

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
        follower= info.context.user
        try:
            followedUser = User.objects.get(username=username)
        except User.DoesNotExist:
            raise Exception("user with username doesn't exist")
        
        if FollowersCount.objects.filter(follower=follower, user=followedUser).exists():
            FollowersCount.objects.get(follower=follower, user=followedUser).delete()
            return FollowUser(followed=False, message=f"Successfully unfollowed {username}.")
        else:
            FollowersCount.objects.create(follower=follower, user=followedUser)
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
                    )
                )
            ).get(username=username)
            
            return user.profile
        except User.DoesNotExist:
            return None

    @login_required
    def resolve_search_profiles(self, info, username):
        if not username:
            return []
        
        users = User.objects.filter(username__icontains=username)
        return Profile.objects.filter(user__in=users)

    @login_required
    def resolve_feed(self, info):
        current_user = info.context.user
        following_user_ids = FollowersCount.objects.filter(follower=current_user).values_list('user__id', flat=True)
        return Post.objects.filter(user__id__in=following_user_ids).order_by('-created_at')

    @login_required
    def resolve_suggestions(self, info):
        current_user = info.context.user
        following_user_ids = FollowersCount.objects.filter(follower=current_user).values_list('user__id', flat=True)
        
        exclude_ids = list(following_user_ids) + [current_user.id]
        
        suggestions_users = User.objects.exclude(id__in=exclude_ids).order_by('?')[:4]
        
        return Profile.objects.filter(user__in=suggestions_users)

