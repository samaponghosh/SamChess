from django.apps import AppConfig


class ChessappConfig(AppConfig):
    name = 'ChessApp'
    # def ready(self):
    #     from .models import gametable
    #     g = gametable.objects.all()
    #     for i in g:
    #         i.opponent_online = i.owner_online = False
    #         i.save()
    #     print("Resetting online statuses")
