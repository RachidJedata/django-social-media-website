import pika
import os
import json

def publish_to_queue(queue_name, message):
    """
    Publishes a message to a RabbitMQ queue.
    """
    connection = None
    try:
        # Connect to RabbitMQ using the service name from Docker Compose
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=os.environ.get('RABBITMQ_HOST', 'rabbitmq'),
                port=5672
            )
        )
        channel = connection.channel()

        # Declare the queue. It's idempotent, so it's safe to call.
        channel.queue_declare(queue=queue_name, durable=True)

        # Publish the message using Direct Exchange
        channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE  # Make the message durable
            )
        )
        print(f" [x] Sent message to '{queue_name}'")

    except pika.exceptions.AMQPConnectionError as e:
        print(f"Error connecting to RabbitMQ: {e}")
        # You could implement retry logic here for a production system.

    finally:
        if connection and connection.is_open:
            connection.close()
