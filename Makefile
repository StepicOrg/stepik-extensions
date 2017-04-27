SHELL := /bin/bash
VIRTUAL_ENV ?= $(shell pwd)
PYTHON = $(VIRTUAL_ENV)/bin/python
PIP = $(VIRTUAL_ENV)/bin/pip
REQUIREMENTS = requirements.txt
REF ?= $(shell git symbolic-ref --short -q HEAD)

help:
	@echo "Please use 'make <target>' where <target> is one of"
	@echo "  init           to init"

init: clean pip-upgrade pip backend frontend

pip: pip-upgrade pip-production

pip-production:
	@$(PIP) install -r $(REQUIREMENTS)

pip-upgrade:
	@$(PIP) install -U pip setuptools

clean:
	@find $(shell pwd)/* -name '*.pyc' -delete

backend:
	@$(PYTHON) manage.py makemigrations
	@$(PYTHON) manage.py migrate

frontend:
	@$(shell) bower install bootstrap#3.3.7

run_debug:
	@$(PYTHON) manage.py runserver

prepare_production: init
	@$(PYTHON) manage.py collectstatic --noinput
