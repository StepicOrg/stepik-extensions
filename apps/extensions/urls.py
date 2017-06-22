from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^category/(?P<pk>\d+)/$', views.show_category, name='extensions-show_category'),
    url(r'^upload/$', views.upload, name='extensions-upload'),
    url(r'^$', views.show_all_extensions, name='extensions-show_all_extensions'),
    url(r'^(?P<extension_id>\w+(\.\w+)*)/$', views.get_extension, name='extensions-get_extension'),
    url(r'^(?P<extension_id>\w+(\.\w+)*)/run/$', views.run_extension, name='extensions-run'),
    url(r'^(?P<extension_id>\w+(\.\w+)*)/running/(?P<path>.*)$', views.running_extension, name='extensions-running'),
]
