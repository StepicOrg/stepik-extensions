# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-06-09 03:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('extensions', '0011_auto_20170502_0908'),
    ]

    operations = [
        migrations.AlterField(
            model_name='extension',
            name='imports_path',
            field=models.CharField(default='imports/', max_length=255),
        ),
    ]
