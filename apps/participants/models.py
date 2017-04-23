from django.db import models


# noinspection PyClassHasNoInit
class Participant(models.Model):
    first_name = models.CharField(max_length=20, blank=False)
    last_name = models.CharField(max_length=20, blank=False)
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)
    is_removed = models.BooleanField(default=False)

    def __str__(self):
        return self.first_name + ' ' + self.last_name
