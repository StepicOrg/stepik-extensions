# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-04-25 20:02
from __future__ import unicode_literals

from django.db import migrations, models

import apps.extensions.models


class Migration(migrations.Migration):
    dependencies = [
        ('extensions', '0004_auto_20170425_1919'),
    ]

    operations = [
        migrations.AlterField(
            model_name='extension',
            name='logo',
            field=models.ImageField(upload_to=apps.extensions.models._get_upload_path),
        ),
    ]