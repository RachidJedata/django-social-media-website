from django.db import models
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager



class CustomUserManager(BaseUserManager):
    """
    Custom user manager to handle user creation with a UUID primary key.
    """
    def create_user(self, username, password, **extra_fields):
        # The username field is now the primary required field.
        if not username:
            raise ValueError('The Username field must be set')

        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, **extra_fields):
            extra_fields.setdefault('is_staff', True)
            extra_fields.setdefault('is_superuser', True)
            extra_fields.setdefault('is_active', True)

            if extra_fields.get('is_staff') is not True:
                raise ValueError('Superuser must have is_staff=True.')
            if extra_fields.get('is_superuser') is not True:
                raise ValueError('Superuser must have is_superuser=True.')
                
            return self.create_user(username, password, **extra_fields)
            

class User(AbstractBaseUser, PermissionsMixin):
    """
    A custom user model with a UUID as the primary key.
    
    This avoids reliance on the database's auto-incrementing integer.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True,blank=True,null=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150, blank=True,null=True)
    last_name = models.CharField(max_length=150, blank=True,null=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    # REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

# Create your models here.
class Profile(models.Model):
    # This field creates a one-to-one relationship, ensuring each user has exactly one profile.
    # The default name for the database column will be `user_id`
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name="profile")
    bio = models.TextField(blank=True, null=True)
    profileimg = models.ImageField(upload_to='profile_images', default='blank-profile-picture.png')
    location = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.user.username

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE,related_name="posts")
    image = models.ImageField(upload_to='post_images',default="")
    description = models.TextField(null=True,blank=True)
    caption = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # We need to return a string, not the User object itself.
        return self.user.username

class LikePost(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE,related_name="likes")
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        # We need to return a descriptive string. Returning `self.username` would cause an error.
        return f'{self.user.username} liked {self.post.caption[:20]}...'

class FollowersCount(models.Model):
    # A more descriptive name for this model would be `Follow` since it tracks a single follow.
    # Each ForeignKey links to a User.
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')

    def __str__(self):
        # This string representation is much more informative.
        return f'{self.follower.username} follows {self.user.username}'
