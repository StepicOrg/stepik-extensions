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
	@$(shell) sudo npm i -g npm
	@$(shell) sudo npm install -g --save-dev babel-cli@6.24.1
	@$(shell) npm install --save-dev babel-preset-es2015@6.24.1
	@$(shell) npm install requirejs-babel-plugin@0.4.0
	@$(shell) bower install bootstrap#3.3.7
	@$(shell) bower install requirejs#2.3.3

prepare_run: translate-apps-js
	@$(shell) cp -u bower_components/requirejs/require.js apps/main/static/imports/libs/require.js
	@$(shell) cp -u bower_components/jquery/dist/jquery.min.js apps/main/static/imports/libs/jquery.min.js

run_debug: backend frontend prepare_run
	@$(PYTHON) manage.py runserver

prepare_production: init zip-packages translate-apps-js
	@$(PYTHON) manage.py collectstatic --noinput
	@$(shell) cp -u bower_components/requirejs/require.js production/static/imports/libs/require.js

zip-packages:
	@$(shell) bash scripts/zip-packages.sh

translate-apps-js:
	@$(shell) bash scripts/translate-apps-js.sh
