# events/models.py
from django.db import models

class Event(models.Model):
    summary = models.CharField(max_length=255)
    description = models.TextField()
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()

    def __str__(self):
        return self.summary
