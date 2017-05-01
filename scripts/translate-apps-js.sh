#!/usr/bin/env bash
cd apps

for app in $(find * -maxdepth 0 -not -name '__pycache__' -type d)
do
    if [[ -d "${app}/src" ]]
    then
        babel "${app}/src" -d "${app}/static"
    fi
done
