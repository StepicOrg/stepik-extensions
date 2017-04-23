from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^extensions/(?P<extension>\w+)/', views.get_extension, name='get_extension'),
    url(r'^category/(?P<pk>\d+)/', views.show_category, name='show_category'),
    url(r'^$', views.index, name='main-index'),
]
