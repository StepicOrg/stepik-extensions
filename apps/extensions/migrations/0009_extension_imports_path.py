# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-05-01 12:21
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('extensions', '0008_extension_extract_path'),
    ]

    operations = [
        migrations.AddField(
            model_name='extension',
            name='imports_path',
            field=models.URLField(default='imports/libs/'),
        ),
    ]
