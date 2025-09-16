import pika
import os
import sys
import json
import time

# /app is mounted to ./backend, so we add it to sys.path
sys.path.append('/app')


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_book.settings')

# from django.db import connection

# def wait_for_db():
#     while True:
#         try:
#             with connection.cursor() as cursor:
#                 cursor.execute("SELECT 1;")
#             print("DB ready")
#             break
#         except Exception:
#             print("Waiting for DB...")
#             time.sleep(2)

# # Call before django.setup()
# wait_for_db()


import django
django.setup()

# Now imports from 'core' work
from core.tasks import process_image_and_update_post


def callback(ch, method, properties, body):
    """
    Callback function that is executed when a message is received.
    """
    print(" [x] Received message...")
    payload = json.loads(body)

    post_id = payload.get("post_id")
    image_data = payload.get("image_base64_data")

    if post_id and image_data:
        process_image_and_update_post(post_id, image_data)

    # Acknowledge the message to remove it from the queue
    ch.basic_ack(delivery_tag=method.delivery_tag)
    print(" [x] Done.")


def connect_rabbitmq(max_retries=0, backoff=5):
    """
    Connect to RabbitMQ, retrying until it succeeds.
    max_retries=0 means retry forever
    backoff: initial delay in seconds
    """
    rabbit_host = os.environ.get('RABBITMQ_HOST', 'rabbitmq')
    rabbit_port = int(os.environ.get('RABBITMQ_PORT', 5672))
    attempt = 0

    while True:
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=rabbit_host, port=rabbit_port)
            )
            print(f"[✓] Connected to RabbitMQ at {rabbit_host}:{rabbit_port}")
            return connection
        except pika.exceptions.AMQPConnectionError:
            attempt += 1
            wait = backoff * attempt  # simple linear backoff
            print(f"[!] RabbitMQ not ready, retrying in {wait}s...")
            time.sleep(wait)
            if max_retries and attempt >= max_retries:
                raise



def start_consumer():
    """
    Connects to RabbitMQ and starts consuming messages.
    """
    connection = connect_rabbitmq()
    channel = connection.channel()
    channel.queue_declare(queue='image_processing_queue', durable=True)
    channel.basic_consume(
        queue='image_processing_queue',
        on_message_callback=callback
    )
    print(' [*] Waiting for messages. To exit press CTRL+C')
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        print("Interrupted, closing connection...")
        if connection.is_open:
            connection.close()
    except Exception as e:
        print(f"Unexpected error: {e}")
        if connection.is_open:
            connection.close()


if __name__ == '__main__':
    start_consumer()
