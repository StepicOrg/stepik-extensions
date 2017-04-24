from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^', include('apps.extensions.urls')),
    url(r'^$', views.index, name='main-index'),
]
