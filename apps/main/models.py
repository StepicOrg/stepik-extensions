from django.contrib.auth.models import Group
from django.db import models


# noinspection PyClassHasNoInit
class Category(models.Model):
    name = models.CharField(max_length=20)
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)
    is_removed = models.BooleanField(default=False)

    def __str__(self):
        return self.name


# noinspection PyClassHasNoInit
class Extension(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=20)
    description = models.TextField(max_length=1024)
    categories = models.ManyToManyField(Category, related_name='extensions')
    user_groups = models.ManyToManyField(Group, related_name='extensions')
    allow_anonymous_user = models.BooleanField(default=False)
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)
    is_removed = models.BooleanField(default=False)

    def __str__(self):
        return self.name
