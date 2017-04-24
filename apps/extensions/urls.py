from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^extensions/$', views.show_all_extensions, name='extensions-show_all_extensions'),
    url(r'^extensions/(?P<extension>\w+)/', views.get_extension, name='extensions-get_extension'),
    url(r'^category/(?P<pk>\d+)/', views.show_category, name='extensions-show_category'),
]
