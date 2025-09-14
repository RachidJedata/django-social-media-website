from rest_framework.views import APIView
from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework import status
from .models import Profile, FollowersCount, Post, LikePost, User
from .serializers import PostSerializer, FeedSerializer, LikePostResponseSerializer, SignUpResponseSerializer, LikePostSerializer, SignupSerializer,ProfileSerializer, FollowSerializer, ProfileResponseSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django.core.cache import cache
from drf_spectacular.types import OpenApiTypes
from django.db import IntegrityError
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.views.decorators.vary import vary_on_headers


# Create your views here.
# Use a decorator to require authentication for the API view
class FeedAPIView(APIView):
    """
        This Path Shows the feed and the homepage for an authenticated user and it returns user_profile 
        and posts of folowers and suggestions users to follow
    """
    permission_classes = [IsAuthenticated]
    serializer_class= [FeedSerializer]
    
    def get(self, request, *args, **kwargs):
        current_user = request.user

        # 1. Get the current user's profile
        try:
            user_profile = Profile.objects.get(user_id=current_user.id)
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        # 2. Get the posts for the user's feed
        # Efficiently get a list of user IDs that the current user is following
        following_user_ids = FollowersCount.objects.filter(follower=current_user).values_list('user_id', flat=True)
        
        # Get all posts from the users being followed in a single query
        feed = Post.objects.filter(user__id__in=following_user_ids).order_by('-created_at')
        
        # 3. Get suggestions for users to follow
        # Get all users the current user is following or is the current user
        followed_users_and_self_ids = list(following_user_ids) + [current_user.id]

        # Get a list of users not followed and not the current user
        suggestions_users = User.objects.exclude(id__in=followed_users_and_self_ids)
        
        # Randomize and limit the suggestions to 4
        suggestions_list = list(suggestions_users.order_by('?')[:4])
        
        # Get the profiles for the suggested users
        suggestions_profiles = Profile.objects.filter(user__in=suggestions_list)
        
        # 4. Serialize the data
        posts_serializer = PostSerializer(feed, many=True)
        user_profile_serializer = ProfileSerializer(user_profile)
        suggestions_serializer = ProfileSerializer(suggestions_profiles, many=True)
        

        # 5. Return a JSON response
        return Response({
            'user_profile': user_profile_serializer.data,
            'posts': posts_serializer.data,
            'suggestions': suggestions_serializer.data
        }, status=status.HTTP_200_OK)


class PostViewSet(viewsets.ModelViewSet):
    """
    A viewset that provides default `list`, `create`, `retrieve`, `update` and `destroy` actions.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    parser_classes = [MultiPartParser, FormParser] # Required for handling file uploads



class SearchAPIView(APIView):
    """
        This url is for searching for other users 
    """
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]


    
    def get(self, request,username, *args, **kwargs):
         # Cache key based on the search parameter
        cache_key = f'search_results_{username}'

        # Try to get the cached search results
        searched_profiles = cache.get(cache_key)

        if not searched_profiles:
            # If not in cache, perform the expensive query
            username_objects = User.objects.filter(username__icontains=username)
            searched_profiles = Profile.objects.filter(user__in=username_objects)
            
            # Cache the results for 1 hour
            cache.set(cache_key, searched_profiles, 60 * 60)
            print("Fetching from DB and setting cache.")
      
        
        searched_serializer = ProfileSerializer(searched_profiles, many=True)

        return Response({'username_profile_list': searched_serializer.data},status=status.HTTP_200_OK)


class LikePostAPIView(APIView):
    """
    API endpoint to like or unlike a post.

    This endpoint allows a user to like or unlike a specific post.
    A POST request with a 'post_id' in the request body is required.
    - If the user has not liked the post, it will be liked and the like count will increase.
    - If the user has already liked the post, it will be unliked and the like count will decrease.

    """


    permission_classes = [IsAuthenticated]
    serializer_class = [LikePostResponseSerializer]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='post_id', 
                type=OpenApiTypes.INT, 
                location=OpenApiParameter.QUERY,
                description='ID of the post to like.'
            ),
        ]
    )

    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        # The list of posts will be cached
        return super().list(request, *args, **kwargs)
    
    @method_decorator(cache_page(60 * 30))  # Cache for 30 minutes
    def retrieve(self, request, *args, **kwargs):
        # A single post will be cached
        return super().retrieve(request, *args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        # Extract the post_id from the request body
        post_id = request.data.get('post_id')
        if not post_id:
            return Response({'error': 'post_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the post object and the current user's username
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        current_user = request.user
        # Check if the user has already liked the post
        try:
            # We filter on the 'post' object directly for better query performance.
            like = LikePost.objects.get(post=post, user=current_user)
            like.delete()
            liked = False
        except LikePost.DoesNotExist:
            try:
                # Create a new like record
                LikePost.objects.create(post=post, user=current_user)
                liked = True
            except IntegrityError:
                # This handles a race condition where a like might be created just before this code runs.
                liked = False

        
        data_response = {
            'liked': liked,
            'likes': LikePostSerializer(LikePost.objects.filter(post_id)).data
        }

        # Return a JSON response with the new like count
        return Response(data_response, status=status.HTTP_200_OK)
    
    
class ProfileAPIView(APIView):
    """
    Retrieve a user's profile information.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = [ProfileResponseSerializer]

    @extend_schema(
        summary="Retrieve a user's profile",
        description="Returns detailed information about a user's profile, including their posts, follower count, and follow status.",
        tags=['Profiles']
    )
    # With auth: cache requested url for each user for 2 hours
    @method_decorator(cache_page(60 * 60 * 2))
    @method_decorator(vary_on_headers("Authorization"))
    def get(self,request,pk,*args, **kwargs):
        user_object = User.objects.get(username=pk)
        user_profile = Profile.objects.get(user=user_object)
        user_posts = Post.objects.filter(user=pk)

        follower = request.user.username
        followed = False

        if FollowersCount.objects.filter(follower=follower, user=pk).first():
            followed = True

        user_followers = len(FollowersCount.objects.filter(user=pk))
        user_following = len(FollowersCount.objects.filter(follower=pk))

        response_data = {
            'user_object': user_object,
            'user_profile': user_profile,
            'user_posts': user_posts,
            'followed': followed,
            'user_followers': user_followers,
            'user_following': user_following,
        }
        # serializer = ProfileResponseSerializer(response_data) 
        return Response(response_data,status=status.HTTP_200_OK)

class FollowAPIView(generics.GenericAPIView):
    """
        to Follow or Unfollow a User with specific ID 
        Authentication Required
    """
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]


    # Implement the POST method to handle follow/unfollow logic
    @extend_schema(
        summary="Follow or Unfollow a user",
        parameters=[
            OpenApiParameter(
                name='user', 
                type=OpenApiTypes.UUID, 
                location=OpenApiParameter.QUERY,
                description='ID of the user to follow.'
            ),
        ],
        tags=['Follow']
    )
    def post(self, request, *args, **kwargs):
        # Get the user to be followed from the validated data
        user_to_follow_username = request.data['user']
        # The follower is the authenticated user
        follower_username = request.user.username

         # Check if the follow relationship exists
        if FollowersCount.objects.filter(follower=follower_username, user=user_to_follow_username).exists():
            # Unfollow if it exists
            FollowersCount.objects.get(follower=follower_username, user=user_to_follow_username).delete()
            return Response({'message': 'Unfollowed successfully', 'followed':False}, status=status.HTTP_200_OK)
        else:
            # Follow if it doesn't exist
            FollowersCount.objects.create(follower=follower_username, user=user_to_follow_username)
            return Response({'message': 'Followed successfully', 'followed':True}, status=status.HTTP_201_CREATED)


class ProfileSettingsAPIView(generics.RetrieveUpdateAPIView):
    """
        This Endpoint retreives and updates the User Profile
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser] # Required for handling file uploads

    # 3. Override get_object to return the authenticated user's profile
    def get_object(self):
        # We need to ensure we return the profile for the authenticated user only
        return self.request.user.profile

    def perform_update(self, serializer):
        # This method is called when the update is performed
        # The serializer handles saving the new data, including the image
        serializer.save()


class CreateUserAPIView(generics.CreateAPIView):
    """
    This API is to create Users
    """
    serializer_class = SignUpResponseSerializer
    permission_classes = [AllowAny] # Allow any user (unauthenticated) to sign up

    def create(self, request, *args, **kwargs):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "User registered successfully."},
            status=status.HTTP_201_CREATED,
            headers=headers
        )