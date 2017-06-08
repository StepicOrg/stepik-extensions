import requests
from django.conf import settings

def auth(request):
    access_token = request.COOKIES.get('access_token')
    is_authorized = access_token is not None
    avatar_uri = None
    full_name = None

    if is_authorized:
        host = request.session.get('host', settings.STEPIK_HOSTS[0])
        if host[-1] != '/':
            host += '/'
        r = requests.get(host + 'api/stepics/1', headers={
            'Authorization': 'Bearer ' + access_token
        })

        if r.status_code == 200:
            json = r.json()
            user = json['users'][0]
            avatar_uri = user['avatar']
            full_name = user['first_name'] + ' ' + user['last_name']

    return {
        'stepik_user': {
            'is_authenticated': is_authorized,
            'avatar_uri': avatar_uri,
            'full_name': full_name,
        },
        'current_path': request.path,
    }
