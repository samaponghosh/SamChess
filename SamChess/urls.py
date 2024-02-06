from django.contrib import admin
from django.urls import path, include
from ChessApp.views import index, game, createGame, register, ongoing, completed

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('', index, name='lobby'),
    path('game/<int:game_id>', game, name = 'game'),
    path('create/', createGame.as_view(), name = 'create'),
    path('signup/', register.as_view(), name = 'signup'),
    path('ongoing/', ongoing, name = 'ongoing'),
    path('completed/', completed, name = 'completed'),
]
