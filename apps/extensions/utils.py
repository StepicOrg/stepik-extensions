import random

import os
from django.core.files.storage import default_storage


def get_upload_path(instance=None, filename=None):
    path = os.path.join('extensions',
                        '{:02X}'.format(random.randint(0, 255)),
                        '{:08X}'.format(random.randint(0, 2 ** 31 - 1)),
                        '{:08X}'.format(random.randint(0, 2 ** 31 - 1)))
    if default_storage.exists(path):
        return get_upload_path(instance, filename)
    return path
