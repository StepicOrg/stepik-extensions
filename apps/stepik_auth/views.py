from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.urls import reverse, NoReverseMatch
from django.utils.http import urlencode
from django.views.decorators.http import require_http_methods

from apps.stepik_auth.forms import LoginForm


def login(request):
    if request.method == 'GET':
        try:
            host = request.session['host']
        except KeyError:
            host = 'https://stepik.org/'

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
            client_id = "gTUqSYtRjiT9wnrmCYEWKDR2ZfeDOcdlNN8Q0Avc"
            redirect_uri = '{scheme}://{host}{path}'.format(
                scheme=request.scheme,
                host=request.META['HTTP_HOST'],
                path=reverse('stepik_auth-authorize'),
            )
            try:
                request.session['target'] = reverse(cleaned_data['target'])
            except NoReverseMatch:
                request.session['target'] = redirect_uri

            params = {'client_id': client_id,
                      'redirect_uri': redirect_uri,
                      'scope': 'write',
                      'response_type': 'code',
                      }
            host = cleaned_data['host']
            response = redirect(host + 'oauth2/authorize/?' + urlencode(params))
            request.session['host'] = host
            return response
        else:
            context = {
                'title': 'Login',
                'form': form,
                'language': request.LANGUAGE_CODE,
            }
            return render(request, 'stepik_auth/login.html', context)


@require_http_methods(["POST"])
def logout(request):
    request.session.clear()
    return HttpResponse(content_type="application/json")


def authorize():
    return None
