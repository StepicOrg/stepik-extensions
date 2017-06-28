import requests
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse, NoReverseMatch
from django.utils.http import urlencode

from apps.stepik_auth.forms import LoginForm


def login(request):
    if request.method == 'GET':
        try:
            host = request.session['host']
        except KeyError:
            host = settings.STEPIK_DEFAULT_HOST

        form = LoginForm(initial={
            'host': host,
            'target': request.GET.get('target', ''),
        })
        context = {
            'title': 'Login',
            'form': form,
            'language': request.LANGUAGE_CODE,
        }
        return render(request, 'stepik_auth/login.html', context)
    elif request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            cleaned_data = form.cleaned_data
            redirect_uri = '{scheme}://{host}{path}'.format(
                scheme=request.scheme,
                host=request.META['HTTP_HOST'],
                path=reverse('stepik_auth-authorize'),
            )
            try:
                request.session['target'] = reverse(cleaned_data['target'])
            except NoReverseMatch:
                request.session['target'] = reverse('main-index')

            params = {'client_id': settings.STEPIK_AUTH_CLIENT_ID,
                      'redirect_uri': redirect_uri,
                      'response_type': 'code',
                      }
            host = cleaned_data['host']
            response = redirect(host + settings.STEPIK_OAUTH2_AUTHORIZE_CODE_PATH + '?' + urlencode(params))
            request.session['host'] = host
            return response
        else:
            context = {
                'title': 'Login',
                'form': form,
                'language': request.LANGUAGE_CODE,
            }
            return render(request, 'stepik_auth/login.html', context)


def logout(request):
    redirect_uri = request.GET.get('redirect_uri', '/')
    response = redirect(redirect_uri)
    response.delete_cookie('access_token')
    return response


def authorize(request):
    if 'code' not in request.GET:
        if 'error' in request.GET:
            error = request.GET['error']
            if error == 'access_denied':
                text = 'Access denied'
            else:
                text = 'Not logged'
        else:
            text = 'Unknown error'

        context = {
            'title': 'Error login',
            'text': text,
            'language': request.LANGUAGE_CODE,
        }
        return render(request, 'stepik_auth/error_auth.html', context)
    else:
        target = request.session.get('target', None)
        if target is None:
            target = reverse('main-index')

        response = redirect(target)
        code = request.GET['code']
        host = request.session['host']
        if host[-1] != '/':
            host += '/'
        redirect_uri = '{scheme}://{host}{path}'.format(
            scheme=request.scheme,
            host=request.META['HTTP_HOST'],
            path=reverse('stepik_auth-authorize'),
        )
        r = requests.post(host + 'oauth2/token/', data={
            'grant_type': 'authorization_code',
            'client_id': settings.STEPIK_AUTH_CLIENT_ID,
            'code': code,
            'redirect_uri': redirect_uri
        })

        if r.status_code == 200:
            max_age = r.json()['expires_in']
            access_token = r.json()['access_token']

            response.set_cookie('access_token', access_token, max_age=max_age)
            response.set_cookie('host', host, max_age=max_age)
        else:
            context = {
                'title': 'Error login',
                'text': 'Unauthorized',
                'language': request.LANGUAGE_CODE,
            }
            return render(request, 'stepik_auth/error_auth.html', context)
        return response
