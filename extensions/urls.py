"""extensions URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin

urlpatterns = [
    url(r'^about/', include('apps.about.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'^auth/', include('apps.stepik_auth.urls')),
    url(r'^develop/', include('apps.develop.urls')),
    url(r'^extensions/', include('apps.extensions.urls')),
    url(r'^faq/', include('apps.faq.urls')),
    url(r'^news/', include('apps.news.urls')),
    url(r'^participants/', include('apps.participants.urls')),
    url(r'^', include('apps.main.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
