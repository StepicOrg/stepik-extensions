from django.shortcuts import render, redirect

from apps.extensions.models import Category, Extension


def get_extension(request, extension):
    # Remove this block on May 1, 2017
    if extension in ['about', 'develop', 'faq', 'news', 'participants']:
        return redirect('/' + extension, permanent=True)

    context = {
        'title': 'Unknown: ' + extension,
        'extension_id': extension,
        'language': request.LANGUAGE_CODE,
    }
    return render(request, 'extensions/unknown.html', context)


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
    return render(request, 'extensions/index.html', context)


def show_all_extensions(request):
    return show_category(request)
