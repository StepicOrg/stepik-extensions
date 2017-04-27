from django import forms
from django.conf import settings


# noinspection PyClassHasNoInit
class LoginForm(forms.Form):
    host = forms.URLField(label='Хост:')
    target = forms.CharField(widget=forms.HiddenInput, required=False)

    def clean(self):
        cleaned_data = super(LoginForm, self).clean()
        host = cleaned_data.get('host')
        if host[-1] != '/':
            host += '/'
            cleaned_data['host'] = host

        if host not in settings.STEPIK_HOSTS:
            message = ('Input a host which support the Stepik API (by default: {default_host})'
                       .format(default_host=settings.STEPIK_DEFAULT_HOST))
            self.add_error('host', message)

        return cleaned_data
