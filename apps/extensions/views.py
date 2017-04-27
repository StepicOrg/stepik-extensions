from django.core.files.base import ContentFile
from django.shortcuts import render, redirect

from apps.extensions.forms import ExtensionUploadForm
from apps.extensions.models import Category, Extension


def get_extension(request, extension_id, run=False):
    # Remove this block on June 1, 2017
    if extension_id in ['about', 'develop', 'faq', 'news', 'participants']:
        return redirect('/' + extension_id, permanent=True)

    categories = Category.get_categories()
    context = {
        'title': 'Unknown: ' + extension_id,
        'language': request.LANGUAGE_CODE,
        'categories': categories,
        'run': run,
    }

    try:
        extension = Extension.objects.prefetch_related('categories').get(pk=extension_id)
        context['extension'] = extension
        try:
            category = extension.get_primary_category()
            context['active_category'] = category
            context['title'] = extension.name
        except IndexError:
            pass
        return render(request, 'extensions/extension.html', context)
    except Extension.DoesNotExist:
        context['extension_id'] = extension_id
        render(request, 'extensions/unknown.html', context)


def show_category(request, pk=None):
    categories = Category.get_categories()

    if pk is not None:
        category = Category.objects.prefetch_related('extensions').get(pk=pk)
        if category is not None:
            extensions = category.get_extensions()
        else:
            extensions = []
    else:
        category = None
        extensions = Extension.get_extensions()

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


def upload(request):
    if request.method == 'GET':
        form = ExtensionUploadForm()
        context = {
            'title': 'Upload Extension',
            'form': form,
            'language': request.LANGUAGE_CODE,
        }
        return render(request, 'extensions/upload.html', context)
    elif request.method == 'POST':
        form = ExtensionUploadForm(request.POST, request.FILES)
        if form.is_valid():
            cleaned_data = form.cleaned_data
            source = cleaned_data['source']
            package_json = cleaned_data['package.json']
            data = {
                'id': package_json['id'],
                'name': package_json['name'],
                'description': package_json['description'],
                'version': package_json['version'],
                'allow_anonymous_user': package_json['allow_anonymous_user'],
                'source': source
            }
            extension = Extension(**data)
            extension.save()
            logo = ContentFile(cleaned_data['logo'])
            extension.logo.save(content=logo, name=data['id'] + '.logo')

            context = {
                'title': 'Upload Extension',
                'extension': extension,
                'language': request.LANGUAGE_CODE,
            }
            return render(request, 'extensions/uploaded.html', context)
        else:
            context = {
                'title': 'Upload Extension',
                'form': form,
                'language': request.LANGUAGE_CODE,
            }
            return render(request, 'extensions/upload.html', context)


def run_extension(request, extension_id):
    return get_extension(request, extension_id, run=True)


def running_extension(request, extension_id):
    return get_extension(request, extension_id)
