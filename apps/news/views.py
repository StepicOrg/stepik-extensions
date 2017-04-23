from django.shortcuts import render
from django.utils import timezone

from apps.news.models import New


def index(request):
    topics = New.objects.filter(is_removed=False, pub_date__lte=timezone.now()).order_by('-pub_date').all()

    context = {
        'title': 'News',
        'topics': topics,
        'language': request.LANGUAGE_CODE,
    }
    return render(request, 'news/index.html', context)
