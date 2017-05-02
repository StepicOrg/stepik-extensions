#!/usr/bin/env bash
cd packages

packages=$(find * -maxdepth 0 -type d)
mkdir -p ../production/packages
packages_dir=$(pwd)

for package in ${packages}
do
    if [[ -d "${package}/src/js" ]]
    then
        babel ${package}/src/js -d ${package}/static/js
    fi

    dirs=$(find * -not -iwholename "${package}/src/*" -type d)
    for dir in ${dirs}
    do
        mkdir -p ../production/tmp/${dir}
    done

    files=$(find * -not -iwholename "${package}/src/*" -type f)
    for file in ${files}
    do
        cp ${file} ../production/tmp/${file}
    done
    cd ../production/tmp/
    rm ../packages/${package}.zip
    zip -r -D -9 ../packages/${package}.zip ${package}
    cd "${packages_dir}"
done
rm -r ../production/tmp
cd ..