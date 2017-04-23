from django.db import models
from django.utils import timezone


class Develop(models.Model):
    text = models.TextField()
    pub_date = models.DateTimeField('date published')
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)
    language = models.CharField(max_length=20, default='en')
    is_removed = models.BooleanField(default=False)

    def __str__(self):
        return self.text

    def save(self, *args, **kwargs):
        if self.pub_date is None:
            self.pub_date = timezone.now()

        super(Develop, self).save(*args, **kwargs)
