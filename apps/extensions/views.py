import mimetypes
import shutil
from zipfile import ZipFile

import os
from django.conf import settings
from django.core.files.base import ContentFile
from django.http import Http404, HttpResponse
from django.shortcuts import render, redirect

from apps.extensions.forms import ExtensionUploadForm
from apps.extensions.models import Category, Extension
from apps.extensions.utils import get_upload_path


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
        context['title'] = extension.name
        try:
            category = extension.get_primary_category()
            context['active_category'] = category
        except IndexError:
            pass
        return render(request, 'extensions/extension.html', context)
    except Extension.DoesNotExist:
        context['extension_id'] = extension_id
        return render(request, 'extensions/unknown.html', context)


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
            packages = cleaned_data['packages']
            extensions = []

            for key in packages:
                package = packages[key]
                package_json = package['package.json']
                data = {
                    'id': package_json['id'],
                    'name': package_json['name'],
                    'description': package_json['description'],
                    'version': package_json['version'],
                    'allow_anonymous_user': package_json['allow_anonymous_user'],
                    'source': source,
                    'extract_path': os.path.join(get_upload_path(), package_json['id']),
                }
                extension = Extension(**data)
                extension.save()
                logo = ContentFile(package['logo'])
                extension.logo.save(content=logo, name=data['id'] + '.logo')
                extensions += [extension]
                # FIXME ATTENTION! Vulnerability: big file after extract
                with ZipFile(source) as zip_package:
                    path = os.path.join(settings.MEDIA_ROOT, extension.extract_path)
                    package_root = package['path']
                    if not package_root:
                        zip_package.extractall(path=path)
                    else:
                        extract_package(zip_package, package_root, path)

            context = {
                'title': 'Upload Extension',
                'extensions': extensions,
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


def extract_package(zip_package, package_root, path):
    package_path = package_root + '/'
    package_path_len = len(package_path)
    for member in zip_package.namelist():
        if member.startswith(package_path):
            target_path = os.path.join(path, member[package_path_len:])
            upperdirs = os.path.dirname(target_path)
            if upperdirs and not os.path.exists(upperdirs):
                os.makedirs(upperdirs)
            with zip_package.open(member, 'r') as source, \
                    open(target_path, "wb") as target:
                shutil.copyfileobj(source, target)


def run_extension(request, extension_id):
    return get_extension(request, extension_id, run=True)


def running_extension(request, extension_id, path):
    try:
        extension = Extension.objects.prefetch_related('categories').get(pk=extension_id)
        imports_path = extension.imports_path
        if path and imports_path and path.startswith(extension.imports_path):
            return redirect(settings.STATIC_URL + 'imports/libs/' + path[len(imports_path):])

        if path is None or path == '':
            path = '/index.html'
        if path[-1] == '/':
            path += 'index.html'

        absolute_path = extension.get_source_file_path(path)
        with open(absolute_path, 'rb') as file:
            content = file.read()
            content_type, _ = mimetypes.guess_type(absolute_path)
            return HttpResponse(content=content, content_type=content_type)
    except (Extension.DoesNotExist, FileNotFoundError):
        raise Http404('File not found\n Extension: {0}\nPath:{1}'.format(extension_id, path))
