from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^$', views.index, name='main-index'),
    url(r'^robots.txt$', views.robots, name='robots'),
    url(r'^sitemap.xml$', views.sitemap, name='sitemap'),
]
