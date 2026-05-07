from django.db import models

class Hospital(models.Model):
    name = models.CharField(max_length=100)
    current_wait = models.IntegerField()
    current_patients = models.IntegerField()

    def __str__(self):
        return self.name
