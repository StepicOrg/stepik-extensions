import json
import os
import zipfile
from zipfile import ZipFile, BadZipFile

from django import forms

from apps.extensions.models import Extension
from apps.extensions.utils import check_package_json


# noinspection PyClassHasNoInit
class ExtensionUploadForm(forms.Form):
    source = forms.FileField()

    def clean(self):
        cleaned_data = self.cleaned_data
        source = cleaned_data['source']

        if not zipfile.is_zipfile(source):
            self.set_source_error(cleaned_data, "File is not zip")
        else:
            packages = dict()
            try:
                with ZipFile(source) as zip_package:
                    if 'package.json' in zip_package.namelist():
                        package, ext_id = self.check_package(zip_package, cleaned_data, 'package.json')
                        if package is not None:
                            packages[ext_id] = package
                    else:
                        for filename in zip_package.namelist():
                            path = filename.split('/')
                            depth = len(path)
                            if depth == 2 and path[1] == 'package.json':
                                package, ext_id = self.check_package(zip_package, cleaned_data, filename)
                                if package is None:
                                    break
                                package['path'] = os.path.join(*path[:-1])
                                packages[ext_id] = package
            except BadZipFile:
                self.set_source_error(cleaned_data, "File is not zip")

            cleaned_data['packages'] = packages

        return cleaned_data

    def set_source_error(self, cleaned_data, message):
        cleaned_data['source'] = None
        self.add_error('source', message)

    def check_package(self, zip_package, cleaned_data, filename):
        log = ["Checking " + filename]
        try:
            with zip_package.open(filename) as package:
                content = str(package.read(), encoding='UTF-8')
                try:
                    package_json = json.loads(content)
                except ValueError:
                    log += [filename + " is not JSON"]
                    self.set_source_error(cleaned_data, log)
                    return None, None
                else:
                    errors = check_package_json(package_json)

                    if errors is not None and len(errors) > 0:
                        log += errors
                        self.set_source_error(cleaned_data, log)
                        return None, None
                    else:
                        ext_id = package_json['id']
                        try:
                            Extension.objects.get(pk=ext_id)
                            log += ["Extension exists with same id"]
                            self.set_source_error(cleaned_data, log)
                            return None, None
                        except Extension.DoesNotExist:
                            package = dict()
                            package['package.json'] = package_json
                            path = filename.split('/')
                            logo_filename = '/'.join(path[0:-1] + [package_json['logo']])
                            with zip_package.open(logo_filename) as file:
                                package['logo'] = file.read()
                            return package, ext_id
        except KeyError as e:
            self.set_source_error(cleaned_data, str(e))
            return None, None
