from django import forms


class LoginForm(forms.Form):
    host = forms.URLField(label='Хост:')
    target = forms.CharField(widget=forms.HiddenInput, required=False)

    def clean(self):
        cleaned_data = super(LoginForm, self).clean()
        host = cleaned_data.get('host')
        if host[-1] != '/':
            host += '/'
            cleaned_data['host'] = host

        hosts = (
            'https://stepik.org/',
            'https://dev.stepik.org/',
            'https://release.stepik.org/',
            'https://sb.stepic.org/',
        )

        if host not in hosts:
            self.add_error('host', 'Input a host which support the Stepik API, https://stepik.org')

        return cleaned_data
