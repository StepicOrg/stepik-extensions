from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^extensions/upload/$', views.upload, name='extensions-upload'),
    url(r'^extensions/$', views.show_all_extensions, name='extensions-show_all_extensions'),
    url(r'^extensions/(?P<extension_id>\w+)/$', views.get_extension, name='extensions-get_extension'),
    url(r'^extensions/(?P<extension_id>\w+)/run/$', views.run_extension, name='extensions-run'),
    url(r'^extensions/(?P<extension_id>\w+)/running/(?P<path>.*)$', views.running_extension, name='extensions-running'),
    url(r'^category/(?P<pk>\d+)/$', views.show_category, name='extensions-show_category'),
]
