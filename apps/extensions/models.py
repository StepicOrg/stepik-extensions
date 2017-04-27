import os

from django.conf import settings
from django.contrib.auth.models import Group
from django.db import models

# noinspection PyClassHasNoInit
from apps.extensions.utils import get_upload_path


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
    logo = models.ImageField(upload_to=get_upload_path)
    source = models.FileField(upload_to=get_upload_path)
    extract_path = models.CharField(max_length=255, editable=False, blank=True)

    def __str__(self):
        return self.name

    def get_primary_category(self):
        return self.categories.filter(is_removed=False).order_by('position').all()[0]

    @staticmethod
    def get_extensions():
        return Extension.objects.filter(is_removed=False).order_by('name').all()

    def get_source_file_url(self, path):
        """
        :param path: absolute path file in extension package
        :return: URL for source file
        """
        if len(path) == 0:
            path = '/'
        if path[0] != '/':
            path = '/' + path
        return settings.MEDIA_URL + self.extract_path + os.path.abspath(path)

    def get_source_file_path(self, path):
        """
        :param path: absolute path file in extension package
        :return: path for source file
        """
        if len(path) == 0:
            path = '/'
        if path[0] != '/':
            path = '/' + path
        return os.path.sep.join((settings.MEDIA_ROOT, self.extract_path, os.path.abspath(path)))
