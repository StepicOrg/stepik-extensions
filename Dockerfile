FROM debian:jessie

LABEL maintainer Petrov Alexander <alexander.petrov@stepik.org>

RUN apt-get update && apt-get install -y \
                       python3 \
                       python3-pip \
                       python3-dev \
                       build-essential \
                       zlib1g-dev \
                       libjpeg-dev \
                       curl

RUN pip3 install -U setuptools

RUN echo 'deb http://nginx.org/packages/debian/ jessie nginx' >> /etc/apt/sources.list &&\
echo 'deb-src http://nginx.org/packages/debian/ jessie nginx' >> /etc/apt/sources.list &&\
curl http://nginx.org/keys/nginx_signing.key | apt-key add -

RUN apt-get update && apt-get install -y nginx=1.12.0-1~jessie

ENV project_path=/home/extensions

COPY apps $project_path/apps
COPY extensions $project_path/extensions
COPY scripts $project_path/scripts
COPY .babelrc $project_path/.babelrc
COPY Makefile $project_path/Makefile
COPY manage.py $project_path/manage.py
COPY requirements.txt $project_path/requirements.txt

RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get update && apt-get install -y nodejs git

RUN cd $project_path && pip3 install -r $project_path/requirements.txt
RUN cd $project_path && npm install -g --save-dev babel-cli@6.24.1
RUN cd $project_path && npm install --save-dev babel-preset-es2015@6.24.1
RUN cd $project_path && npm install requirejs-babel-plugin@0.4.0
RUN cd $project_path && npm install -g bower
RUN cd $project_path && bower install --allow-root bootstrap#3.3.7
RUN cd $project_path && bower install --allow-root bootstrap-select#1.12.2
RUN cd $project_path && bower install --allow-root bootstrap-fileinput#4.3.9
RUN cd $project_path && bower install --allow-root requirejs#2.3.3
RUN cd $project_path && bower install --allow-root flot#0.8.3
RUN cd $project_path && bower install --allow-root domReady#2.0.1

RUN cd $project_path && bash scripts/translate-apps-js.sh
RUN cd $project_path && bash scripts/prepare_imports.sh
RUN cd $project_path && python3 manage.py collectstatic --noinput

COPY deploy/docker_nginx.conf /etc/nginx/conf.d/nginx.conf
ARG server_name="localhost"
RUN sed "s/{{\s*server_name\s*}}/$server_name/g" /etc/nginx/conf.d/nginx.conf > /etc/nginx/conf.d/nginx.conf.temp
RUN cp -f /etc/nginx/conf.d/nginx.conf.temp /etc/nginx/conf.d/nginx.conf
RUN rm /etc/nginx/conf.d/nginx.conf.temp
RUN rm /etc/nginx/conf.d/default.conf

RUN systemctl enable nginx

RUN apt-key adv --recv-keys --keyserver keyserver.ubuntu.com 0xcbcb082a1bb943db &&\
    echo "deb [arch=amd64,i386] http://lon1.mirrors.digitalocean.com/mariadb/repo/10.1/debian jessie main" >> /etc/apt/sources.list &&\
    echo "deb-src http://lon1.mirrors.digitalocean.com/mariadb/repo/10.1/debian jessie main" >> /etc/apt/sources.list &&\
    apt-get update &&\
    apt-get install mariadb-server

RUN cd $project_path && mkdir -p develop/db && python3 manage.py migrate

CMD service nginx start &&\
    cd $project_path &&\
    gunicorn extensions.wsgi:applicationc
    /bin/bash

EXPOSE 80
