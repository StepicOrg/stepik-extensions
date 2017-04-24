SHELL := /bin/bash
VIRTUAL_ENV ?= $(shell pwd)
PYTHON = $(VIRTUAL_ENV)/bin/python
PIP = $(VIRTUAL_ENV)/bin/pip
REQUIREMENTS = requirements.txt
REF ?= $(shell git symbolic-ref --short -q HEAD)

help:
	@echo "Please use 'make <target>' where <target> is one of"
	@echo "  init           to init"

init: clean pip-upgrade pip

pip: pip-upgrade pip-production

pip-production:
	@$(PIP) install -r $(REQUIREMENTS)

pip-upgrade:
	@$(PIP) install -U pip setuptools

clean:
	@find $(shell pwd)/* -name '*.pyc' -delete
