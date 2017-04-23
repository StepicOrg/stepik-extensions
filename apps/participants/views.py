from django.shortcuts import render

from apps.participants.models import Participant


def index(request):
    participants = Participant.objects.filter(is_removed=False).order_by('first_name').all()

    context = {
        'title': 'Participants',
        'participants': participants,
        'language': request.LANGUAGE_CODE,
    }
    return render(request, 'participants/index.html', context)
