import os
import django
import random
import uuid
from faker import Faker
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_book.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Profile, Post, LikePost, FollowersCount
from django.db import IntegrityError

# Get the User model
User = get_user_model()

# Initialize Faker
fake = Faker()

# --- Configuration ---
NUM_USERS = 50
POSTS_PER_USER = 10
# ---------------------

def run():
    """
    Main function to populate the database with mock data.
    """
    print("Starting to populate database with mock data...")
    print("--- WARNING: This script will delete all existing data from Profile, Post, LikePost, and FollowersCount tables. ---")

    # --- Clean up existing data ---
    Profile.objects.all().delete()
    Post.objects.all().delete()
    LikePost.objects.all().delete()
    FollowersCount.objects.all().delete()
    print("Existing data has been cleared from models.")

    # --- Create Users and Profiles ---
    print(f"Creating {NUM_USERS} users...")
    users = []
    for _ in range(NUM_USERS):
        username = fake.user_name()
        firstName = fake.first_name_male()
        lastName = fake.last_name_male()
        try:
            user = User.objects.create_user(username=username, password='admin123', first_name=firstName,last_name=lastName)
            # Profile.objects.create(user=user)
            users.append(user)
        except IntegrityError:
            # Handle cases where a username might already exist
            continue
    print(f"Created {len(users)} users and profiles.")

    # --- Create Posts ---
    print("Creating posts...")
    posts = []
    for user in users:
        for _ in range(POSTS_PER_USER):
            # Create a realistic creation date within the last 30 days
            created_at = datetime.now() - timedelta(days=random.randint(1, 30), seconds=random.randint(1, 86400))
            post = Post.objects.create(
                user=user,
                # image=f'post_images/placeholder_{fake.random_int(min=1, max=10)}.jpg',
                caption=fake.sentence(nb_words=10),
                created_at=created_at
            )
            posts.append(post)
    print(f"Created {len(posts)} posts.")
    

    # --- Create Likes ---
    print("Creating likes...")
    all_posts = Post.objects.all()
    for user in users:
        # Each user will like a random number of posts
        num_likes = random.randint(0, len(all_posts) // 5)
        liked_posts = random.sample(list(all_posts), num_likes)
        
        for post in liked_posts:
            try:
                LikePost.objects.create(post=post, user=user)
            except IntegrityError:
                # Handle cases where a user might like the same post twice
                continue
    print("Likes have been created.")

    # --- Create Follows ---
    print("Creating followers...")
    for user in users:
        # A user can follow up to 10 other users
        num_follows = random.randint(0, 10)
        users_to_follow = random.sample([u for u in users if u != user], num_follows)
        for followed_user in users_to_follow:
            try:
                # The 'follower' is the one initiating the follow, 'user' is the one being followed.
                FollowersCount.objects.create(follower=user, user=followed_user)
            except IntegrityError:
                # Handle cases where a user might try to follow someone they already follow
                continue
    print("Follows have been created.")

    print("\n--- Population complete! ---")
    print(f"Total Users: {User.objects.count()}")
    print(f"Total Posts: {Post.objects.count()}")
    print(f"Total Likes: {LikePost.objects.count()}")
    print(f"Total Follows: {FollowersCount.objects.count()}")

if __name__ == '__main__':
    run()
