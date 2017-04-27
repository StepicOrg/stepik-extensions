import os
import random

from django.contrib.auth.models import Group
from django.core.files.storage import default_storage
from django.db import models


# noinspection PyClassHasNoInit
class Category(models.Model):
    name = models.CharField(max_length=20)
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)
    is_removed = models.BooleanField(default=False)
    position = models.IntegerField(default=-1)

    def __str__(self):
        return self.name

    @staticmethod
    def get_categories():
        return Category.objects.filter(is_removed=False).order_by('position').all()

    def get_extensions(self):
        return self.extensions.filter(is_removed=False).order_by('name').all()


def _get_upload_path(instance, filename):
    path = os.path.join('extensions',
                        '{:02X}'.format(random.randint(0, 255)),
                        '{:08X}'.format(random.randint(0, 2 ** 31 - 1)),
                        '{:08X}'.format(random.randint(0, 2 ** 31 - 1)))
    if default_storage.exists(path):
        return _get_upload_path(instance, filename)
    return path


# noinspection PyClassHasNoInit
class Extension(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=20)
    description = models.TextField(max_length=1024)
    version = models.CharField(max_length=15)
    categories = models.ManyToManyField(Category, related_name='extensions', blank=True)
    user_groups = models.ManyToManyField(Group, related_name='extensions', blank=True)
    allow_anonymous_user = models.BooleanField(default=False)
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)
    is_removed = models.BooleanField(default=False)
    logo = models.ImageField(upload_to=_get_upload_path)
    source = models.FileField(upload_to=_get_upload_path)

    def __str__(self):
        return self.name

    def get_primary_category(self):
        return self.categories.filter(is_removed=False).order_by('position').all()[0]

    @staticmethod
    def get_extensions():
        return Extension.objects.filter(is_removed=False).order_by('name').all()