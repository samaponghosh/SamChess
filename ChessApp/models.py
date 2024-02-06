from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class gametable(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owner")
    opponent = models.ForeignKey(User, on_delete=models.CASCADE, related_name="opponent", null = True)
    owner_side = models.CharField(max_length = 50, default="white")
    owner_online = models.BooleanField(default=False)
    opponent_online = models.BooleanField(default=False)
    # level = models.CharField(max_length=15, null=True, blank=True)
    fen = models.CharField(max_length = 92, null = True, blank = True)
    pgn = models.TextField(null=True, blank=True)    
    winner = models.CharField(max_length = 50, null =True, blank=True)
    CHOICES = ( (1,"Match cratd.,. Waiting for oponet "),(2,"Match sTARted"),(3,"Match' Endded"))
    status = models.IntegerField(default=1,choices=CHOICES)
    
    
    
