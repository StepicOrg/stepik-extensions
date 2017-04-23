from django.shortcuts import render
from django.utils import timezone

from apps.faq.models import Faq


def index(request):
    topics = Faq.objects.filter(is_removed=False, pub_date__lte=timezone.now()).order_by('-pub_date').all()

    context = {
        'title': 'FAQ',
        'topics': topics,
        'language': request.LANGUAGE_CODE,
    }
    return render(request, 'faq/index.html', context)
