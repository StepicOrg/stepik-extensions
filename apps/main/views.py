from django.shortcuts import render, redirect

from apps.main.models import Category, Extension


def index(request):
    # Remove this block on May 1, 2017
    if 'ext' in request.GET:
        ext = request.GET['ext']
        return redirect('/extensions/' + ext, permanent=True)

    return show_category(request)


def get_extension(request, extension):
    # Remove this block on May 1, 2017
    if extension in ['about', 'develop', 'faq', 'news', 'participants']:
        return redirect('/' + extension, permanent=True)

    context = {
        'title': 'Unknown: ' + extension,
        'extension_id': extension,
        'language': request.LANGUAGE_CODE,
    }
    return render(request, 'main/unknown.html', context)


def show_category(request, pk=None):
    categories = Category.objects.filter(is_removed=False).all()

    if pk is not None:
        category = Category.objects.prefetch_related('extensions').get(pk=pk)
        if category is not None:
            extensions = category.extensions.filter(is_removed=False).order_by('name').all()
        else:
            extensions = []
    else:
        category = None
        extensions = Extension.objects.filter(is_removed=False).order_by('name').all()

    if category is not None:
        title = category.name
    else:
        title = 'All extensions'

    context = {
        'title': title,
        'language': request.LANGUAGE_CODE,
        'categories': categories,
        'active_category': category,
        'extensions': extensions,
    }
    return render(request, 'main/index.html', context)
