from rest_framework import serializers
from .models import Post, Profile, User

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'user', 'image', 'caption', 'created_at']
        
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['user', 'bio', 'profileimg']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

class ProfileResponseSerializer(serializers.Serializer):
    user_object = UserSerializer()
    user_profile = ProfileSerializer()
    user_posts = PostSerializer(many=True)
    followed = serializers.BooleanField()
    user_followers = serializers.IntegerField()
    user_following = serializers.IntegerField()

class LikePostResponseSerializer(serializers.Serializer):
    likes = UserSerializer()
    liked = serializers.BooleanField()

class LikePostSerializer(serializers.Serializer):
    post = PostSerializer()
    user = UserSerializer()

class FollowSerializer(serializers.Serializer):
    followed = serializers.BooleanField()
    message = serializers.CharField()

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['bio', 'location', 'profileimg']
        read_only_fields = ['id']

class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Username is already taken."})
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email is already in use."})

        return data

    def create(self, validated_data):
        # Create the user without the password2 field
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        user.save()
        
        # We'll return the user object, but we won't log them in here
        return user

class FeedSerializer(serializers.Serializer):
     posts_serializer = PostSerializer(many=True)
     user_profile_serializer = ProfileSerializer()
     suggestions_serializer = ProfileSerializer(many=True)
        
        

class SignUpResponseSerializer(serializers.Serializer):
    """
    Serializer to define the response structure for a successful signup.
    It includes a simple message to the user.
    """
    message = serializers.CharField()
