#!/usr/bin/env bash

cd bower_components
imports_path=../apps/main/static/imports/

echo "Prepare requirejs"
mkdir -p ${imports_path}requirejs/js/
cp -u -v requirejs/require.js ${imports_path}requirejs/js/require.js

echo "Prepare jQuery"
mkdir -p ${imports_path}jquery/js/
cp -u -v jquery/dist/jquery.min.js ${imports_path}jquery/js/jquery.min.js

echo "Prepare Bootstrap"
mkdir -p ${imports_path}bootstrap/js/
cp -u -v bootstrap/dist/js/bootstrap.min.js ${imports_path}bootstrap/js/bootstrap.min.js

mkdir -p ${imports_path}bootstrap/css/
cp -u -v bootstrap/dist/css/bootstrap.min.css ${imports_path}bootstrap/css/bootstrap.min.css
cp -u -v bootstrap/dist/css/bootstrap-theme.min.css ${imports_path}bootstrap/css/bootstrap-theme.min.css

mkdir -p ${imports_path}bootstrap/fonts/
cp -u -v bootstrap/fonts/* ${imports_path}bootstrap/fonts

echo "Prepare Bootstrap plugins"

echo "Prepare Bootstrap-select plugin"
mkdir -p ${imports_path}bootstrap-select/js/
cp -u -v bootstrap-select/dist/js/bootstrap-select.min.js ${imports_path}bootstrap-select/js/bootstrap-select.min.js

mkdir -p ${imports_path}bootstrap-select/css/
cp -u -v bootstrap-select/dist/css/bootstrap-select.min.css ${imports_path}bootstrap-select/css/bootstrap-select.min.css

echo "Prepare Bootstrap-fileinput plugin"
mkdir -p ${imports_path}bootstrap-fileinput/js/
cp -u -v bootstrap-fileinput/js/fileinput.min.js ${imports_path}bootstrap-fileinput/js/fileinput.min.js

mkdir -p ${imports_path}bootstrap-fileinput/css/
cp -u -v bootstrap-fileinput/css/fileinput.min.css ${imports_path}bootstrap-fileinput/css/fileinput.min.css

mkdir -p ${imports_path}bootstrap-fileinput/img/
cp -u -v bootstrap-fileinput/img/* ${imports_path}bootstrap-fileinput/img

echo "Prepare Flot"
mkdir -p ${imports_path}flot/js/
cp -u -v Flot/jquery.flot.js ${imports_path}flot/js/jquery.flot.js
cp -u -v Flot/jquery.flot.time.js ${imports_path}flot/js/jquery.flot.time.js
cp -u -v Flot/jquery.flot.errorbars.js ${imports_path}flot/js/jquery.flot.errorbars.js

echo "Prepare domReady"
mkdir -p ${imports_path}js/
cp -u -v domReady/domReady.js ${imports_path}js/domReady.js

cd ..
echo "Imports preparing done"