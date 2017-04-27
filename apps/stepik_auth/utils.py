import re

from voluptuous import Schema, Required, All, Length, MultipleInvalid, Invalid

ID_PATTERN = re.compile(r'^[a-z]+[a-z0-9]*$')


def id_check(ext_id):
    if not ID_PATTERN.match(ext_id):
        raise Invalid('Only small Latin letters, numbers and underscore, '
                      'the first character is not a digit')


package_json_1_0_schema = Schema({
    Required('id'): id_check,
    Required('name'): All(str, Length(min=3)),
    Required('description'): All(str, Length(min=3)),
    Required('logo'): str,
    Required('allow_anonymous_user'): bool,
    Required('version'): All(str, Length(min=1)),
    Required('package_version'): '1.0',
}, required=True)


def check_package_json_1_0(package_json):
    try:
        package_json_1_0_schema(package_json)
    except MultipleInvalid as e:
        return 'package.json: {0}'.format(e)


def check_package_json(package_json):
    if 'package_version' in package_json:
        package_version = package_json['package_version']
    else:
        package_version = '1.0'

    if package_version == '1.0':
        return check_package_json_1_0(package_json)

    return "Unknown package version: {0}".format(package_version)