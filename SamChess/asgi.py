

import os
import django

from django.core.asgi import get_asgi_application
from django.urls import path

from channels.http import AsgiHandler
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from ChessApp.consumers import GameConsumer, SingleConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SamChess.settings')
django.setup()

# application = get_asgi_application()
application = ProtocolTypeRouter({
    "http": AsgiHandler(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path(r'game/<int:game_id>', GameConsumer.as_asgi()),
            path(r'single/', SingleConsumer.as_asgi())
        ]),
    ),
})
