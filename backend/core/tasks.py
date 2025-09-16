import base64
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import uuid
import datetime
from django.conf import settings
from celery import shared_task
from django.core.mail import send_mail
from .models import Post


@shared_task
def process_image_and_update_post(post_id, image_base64_data):
    """
    Processes a base64 encoded image and updates a Post.
    """
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        print(f"Post with ID {post_id} not found. Aborting.")
        return

    try:
        if ';base64,' in image_base64_data:
            format, imgstr = image_base64_data.split(';base64,')
            ext = format.split('/')[-1]

            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"{post.user.id}_{timestamp}_{uuid.uuid4().hex}.{ext}"
            data = ContentFile(base64.b64decode(imgstr), name=filename)

            file_path = default_storage.save(filename, data)
            image_url = settings.MY_DOMAIN + default_storage.url(file_path)

            post.image = image_url
            post.save()

            print(f"Successfully processed image for post {post_id} and updated URL.")
            return True
        else:
            print("Invalid image format. Aborting.")
            return False

    except Exception as e:
        print(f"Error processing image for post {post_id}: {e}")
        return False

@shared_task
def send_welcome_email(user_email):
    """
    Sends a welcome email to a newly registered user.
    """
    subject = 'Welcome to Our App!'
    message = 'Thank you for signing up. We are so happy to have you!'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user_email]

    try:
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)
        print(f"Welcome email sent to {user_email}.")
    except Exception as e:
        print(f"Failed to send welcome email to {user_email}: {e}")