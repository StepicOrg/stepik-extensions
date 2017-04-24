from django.shortcuts import redirect


def index(request):
    # Remove this block on May 1, 2017
    if 'ext' in request.GET:
        ext = request.GET['ext']
        return redirect('/extensions/' + ext, permanent=True)

    return redirect('/extensions/')
