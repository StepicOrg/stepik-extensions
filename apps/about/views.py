from django.shortcuts import render
from django.utils import timezone

from apps.about.models import About


def index(request):
    actual_topics = About.objects.filter(pub_date__lte=timezone.now()).order_by('-pub_date')

    if actual_topics.count() > 0:
        language = request.LANGUAGE_CODE
        text = get_text(actual_topics, language)

        if text is None:
            language = request.LANGUAGE_CODE.split('-')[0]
            text = get_text(actual_topics, language)
            if text is None:
                language = 'en'
                text = get_text(actual_topics, language)
            else:
                language = request.LANGUAGE_CODE
                text = ''
    else:
        language = request.LANGUAGE_CODE
        text = ''

    context = {
        'title': 'About',
        'text': text.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&'),
        'language': language,
    }
    return render(request, 'about/index.html', context)


def get_text(actual_topics, language):
    query = actual_topics.filter(language=language)
    if query.count() > 0:
        return query[0].text
    else:
        return None
