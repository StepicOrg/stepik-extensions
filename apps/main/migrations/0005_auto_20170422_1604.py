# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-04-22 16:04
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0008_alter_user_username_max_length'),
        ('main', '0004_auto_20170422_1546'),
    ]

    operations = [
        migrations.AddField(
            model_name='extension',
            name='allow_anonymous_user',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='extension',
            name='user_groups',
            field=models.ManyToManyField(related_name='extensions', to='auth.Group'),
        ),
    ]
