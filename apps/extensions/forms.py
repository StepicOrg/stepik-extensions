import json
from zipfile import ZipFile, BadZipFile

from django import forms

from apps.extensions.models import Extension
from apps.stepik_auth.utils import check_package_json


# noinspection PyClassHasNoInit
class ExtensionUploadForm(forms.Form):
    source = forms.FileField()

    def clean(self):
        cleaned_data = self.cleaned_data
        source = cleaned_data['source']

        try:
            with ZipFile(source) as myzip:
                with myzip.open('package.json') as package:
                    content = str(package.read(), encoding='UTF-8')
                    try:
                        package_json = json.loads(content)
                    except ValueError:
                        cleaned_data['source'] = None
                        self.add_error('source', "package.json is not JSON")
                    else:
                        errors = check_package_json(package_json)

                        if errors is not None and len(errors) > 0:
                            cleaned_data['source'] = None
                            self.add_error('source', errors)
                        else:
                            ext_id = package_json['id']
                            try:
                                Extension.objects.get(pk=ext_id)
                                cleaned_data['source'] = None
                                self.add_error('source', "Extension exists with same id")
                            except Extension.DoesNotExist:
                                cleaned_data['package.json'] = package_json
                                with myzip.open(package_json['logo']) as file:
                                    cleaned_data['logo'] = file.read()

        except BadZipFile:
            cleaned_data['source'] = None
            self.add_error('source', 'File is not zip')
        except KeyError as e:
            cleaned_data['source'] = None
            self.add_error('source', str(e))

        return cleaned_data
