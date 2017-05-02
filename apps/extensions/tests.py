from apps.extensions.utils import check_package_json_1_0


def test_check_package_json_1_0_empty():
    errors = check_package_json_1_0({})
    assert ": required key not provided @ data['" in errors[0]


def test_check_package_json_1_0_wrong_id():
    errors = check_package_json_1_0({
        'id': '..ext',
        'name': 'Ext',
        'description': 'description',
        "logo": "relative/path/to/logo",
        "allow_anonymous_user": True,
        "version": "1.0",
        "package_version": "1.0"
    })
    assert ': Only small' in errors[0]


def test_check_package_json_1_0_correct():
    errors = check_package_json_1_0({
        'id': 'ext',
        'name': 'Ext',
        'description': 'description',
        "logo": "relative/path/to/logo",
        "allow_anonymous_user": True,
        "version": "1.0",
        "package_version": "1.0"
    })
    assert errors is None
