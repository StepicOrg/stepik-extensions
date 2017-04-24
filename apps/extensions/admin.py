from django.contrib import admin

from apps.extensions.models import Category, Extension

admin.site.register(Category)
admin.site.register(Extension)
